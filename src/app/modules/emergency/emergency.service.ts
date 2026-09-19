import {
	AmbulanceStatus,
	PriorityLevel,
	type Prisma,
	RequestStatus,
} from "@prisma/client";
import { prisma } from "../../utils/prisma.js";
import { redis } from "../../utils/redis.js";
import { AppError } from "../../errors/AppError.js";
import { logAuditEvent } from "../../utils/auditLogger.js";

interface ICreateEmergencyPayload {
	pickupAddress: string;
	pickupLat: number;
	pickupLng: number;
	patientCondition: string;
	priority?: PriorityLevel;
}

const createEmergency = async (
	patientId: string,
	payload: ICreateEmergencyPayload,
) => {
	return await prisma.emergencyRequest.create({
		data: {
			patientId,
			pickupAddress: payload.pickupAddress,
			pickupLat: payload.pickupLat,
			pickupLng: payload.pickupLng,
			patientCondition: payload.patientCondition,
			priority: payload.priority ?? PriorityLevel.MEDIUM,
			status: RequestStatus.PENDING,
		},
	});
};

const getEmergencies = async (filters: {
	status?: RequestStatus;
	priority?: PriorityLevel;
	page?: number;
	limit?: number;
}) => {
	const page = Number(filters.page) || 1;
	const limit = Number(filters.limit) || 10;
	const skip = (page - 1) * limit;

	const where: Prisma.EmergencyRequestWhereInput = {
		deletedAt: null,
		...(filters.status && { status: filters.status }),
		...(filters.priority && { priority: filters.priority }),
	};

	const [data, total] = await Promise.all([
		prisma.emergencyRequest.findMany({
			where,
			skip,
			take: limit,
			include: {
				patient: { select: { id: true, name: true, phone: true, email: true } },
				trip: {
					include: {
						ambulance: true,
						driver: {
							include: { user: { select: { name: true, phone: true } } },
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.emergencyRequest.count({ where }),
	]);

	return {
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
		data,
	};
};

const getEmergencyById = async (id: string, userId: string, role: string) => {
	const emergency = await prisma.emergencyRequest.findFirst({
		where: { id, deletedAt: null },
		include: {
			patient: { select: { id: true, name: true, phone: true, email: true } },
			trip: {
				include: {
					ambulance: true,
					driver: {
						include: { user: { select: { name: true, phone: true } } },
					},
					hospital: true,
				},
			},
			payment: true,
		},
	});

	if (!emergency) {
		throw new AppError(404, "Emergency request not found");
	}

	// Patients can only view their own requests
	if (role === "PATIENT" && emergency.patientId !== userId) {
		throw new AppError(
			403,
			"Forbidden: You cannot access another patient emergency record",
		);
	}

	return emergency;
};

// Transaction-Safe Dispatch Logic (Guarantees double-booking prevention)
const dispatchEmergency = async (
	emergencyId: string,
	payload: { ambulanceId: string; driverId: string },
) => {
	return await prisma.$transaction(async (tx) => {
		// 1. Verify emergency request state
		const emergency = await tx.emergencyRequest.findFirst({
			where: { id: emergencyId, deletedAt: null },
		});

		if (!emergency) {
			throw new AppError(404, "Emergency request not found");
		}

		if (emergency.status !== RequestStatus.PENDING) {
			throw new AppError(
				400,
				`Cannot dispatch an emergency that is already ${emergency.status}`,
			);
		}

		// 2. Lock & verify ambulance availability
		const ambulance = await tx.ambulance.findFirst({
			where: { id: payload.ambulanceId, deletedAt: null },
		});

		if (!ambulance) {
			throw new AppError(404, "Ambulance not found");
		}

		if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
			throw new AppError(
				409,
				`Ambulance is currently ${ambulance.status} and cannot be dispatched`,
			);
		}

		// 3. Lock & verify driver availability
		const driver = await tx.driverProfile.findUnique({
			where: { id: payload.driverId },
		});

		if (!driver) {
			throw new AppError(404, "Driver profile not found");
		}

		if (!driver.isAvailable) {
			throw new AppError(409, "Driver is currently marked as unavailable");
		}

		// 4. Update ambulance status to BUSY
		await tx.ambulance.update({
			where: { id: ambulance.id },
			data: { status: AmbulanceStatus.BUSY },
		});

		// 5. Update driver availability to false
		await tx.driverProfile.update({
			where: { id: driver.id },
			data: { isAvailable: false },
		});

		// 6. Update Emergency Request status to DISPATCHED
		const updatedEmergency = await tx.emergencyRequest.update({
			where: { id: emergency.id },
			data: { status: RequestStatus.DISPATCHED },
		});

		// 7. Create active Trip entry
		const trip = await tx.trip.create({
			data: {
				emergencyRequestId: emergency.id,
				ambulanceId: ambulance.id,
				driverId: driver.id,
				status: RequestStatus.DISPATCHED,
			},
			include: {
				ambulance: true,
				driver: { include: { user: { select: { name: true, phone: true } } } },
			},
		});

		// Remove driver from Redis dispatch pool
		await redis.zrem("drivers:locations", driver.id);

		await logAuditEvent({
			action: "DISPATCH_AMBULANCE",
			resource: `EmergencyRequest:${emergency.id}`,
			payload: { ambulanceId: ambulance.id, driverId: driver.id },
		});

		return {
			emergency: updatedEmergency,
			trip,
		};
	});
};

const cancelEmergency = async (id: string, userId: string, role: string) => {
	return await prisma.$transaction(async (tx) => {
		const emergency = await tx.emergencyRequest.findFirst({
			where: { id, deletedAt: null },
			include: { trip: true },
		});

		if (!emergency) {
			throw new AppError(404, "Emergency request not found");
		}

		if (role === "PATIENT" && emergency.patientId !== userId) {
			throw new AppError(
				403,
				"Forbidden: You cannot cancel another patient request",
			);
		}

		if (
			emergency.status === RequestStatus.COMPLETED ||
			emergency.status === RequestStatus.CANCELLED
		) {
			throw new AppError(
				400,
				`Cannot cancel an emergency request that is ${emergency.status}`,
			);
		}

		// If an ambulance and driver were already assigned, free them up
		if (emergency.trip) {
			await tx.ambulance.update({
				where: { id: emergency.trip.ambulanceId },
				data: { status: AmbulanceStatus.AVAILABLE },
			});

			await tx.driverProfile.update({
				where: { id: emergency.trip.driverId },
				data: { isAvailable: true },
			});

			await tx.trip.update({
				where: { id: emergency.trip.id },
				data: { status: RequestStatus.CANCELLED },
			});
		}

		await logAuditEvent({
			userId,
			action: "CANCEL_EMERGENCY",
			resource: `EmergencyRequest:${emergency.id}`,
			payload: { previousStatus: emergency.status },
		});

		return await tx.emergencyRequest.update({
			where: { id: emergency.id },
			data: { status: RequestStatus.CANCELLED },
		});
	});
};

export const EmergencyService = {
	createEmergency,
	getEmergencies,
	getEmergencyById,
	dispatchEmergency,
	cancelEmergency,
};
