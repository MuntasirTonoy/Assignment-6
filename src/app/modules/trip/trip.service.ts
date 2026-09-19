import { AmbulanceStatus, PaymentStatus, RequestStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { logAuditEvent } from "../../utils/auditLogger.js";

const updateTripStatus = async (
	tripId: string,
	userId: string,
	payload: {
		status: RequestStatus;
		hospitalId?: string;
		totalDistanceKm?: number;
	},
) => {
	return await prisma.$transaction(async (tx) => {
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: { ambulance: true, driver: true, emergencyRequest: true },
		});

		if (!trip) {
			throw new AppError(404, "Trip not found");
		}

		if (
			trip.status === RequestStatus.COMPLETED ||
			trip.status === RequestStatus.CANCELLED
		) {
			throw new AppError(
				400,
				`Cannot update a trip that is already ${trip.status}`,
			);
		}

		// Update trip and emergency request statuses
		const updatedTrip = await tx.trip.update({
			where: { id: tripId },
			data: {
				status: payload.status,
				...(payload.hospitalId && { hospitalId: payload.hospitalId }),
				...(payload.totalDistanceKm && {
					totalDistanceKm: payload.totalDistanceKm,
				}),
				...(payload.status === RequestStatus.COMPLETED && {
					completedAt: new Date(),
				}),
			},
			include: { ambulance: true },
		});

		await tx.emergencyRequest.update({
			where: { id: trip.emergencyRequestId },
			data: { status: payload.status },
		});

		// If trip is completed, finalize the process
		if (payload.status === RequestStatus.COMPLETED) {
			// biome-ignore lint/style/noNonNullAssertion: Guaranteed by Zod validation schema
			const distance = payload.totalDistanceKm!;
			const baseFee = Number(trip.ambulance.baseFee);
			const perKmRate = Number(trip.ambulance.perKmRate);
			const totalAmount = baseFee + perKmRate * distance;

			// Create Payment Record
			await tx.payment.create({
				data: {
					emergencyRequestId: trip.emergencyRequestId,
					amount: totalAmount,
					status: PaymentStatus.PENDING,
				},
			});

			// Free up Ambulance and Driver
			await tx.ambulance.update({
				where: { id: trip.ambulanceId },
				data: { status: AmbulanceStatus.AVAILABLE },
			});

			await tx.driverProfile.update({
				where: { id: trip.driverId },
				data: { isAvailable: true },
			});

			// Audit Log
			await logAuditEvent({
				userId,
				action: "COMPLETE_TRIP",
				resource: `Trip:${trip.id}`,
				payload: { totalDistanceKm: distance, amount: totalAmount },
			});
		}

		return updatedTrip;
	});
};

export const TripService = {
	updateTripStatus,
};
