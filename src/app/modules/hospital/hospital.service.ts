import { prisma } from "../../utils/prisma.js";
import { redis } from "../../utils/redis.js";
import { AppError } from "../../errors/AppError.js";

const HOSPITAL_CACHE_KEY = "hospitals:all";

const createHospital = async (payload: {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	availableBeds?: number;
}) => {
	const hospital = await prisma.hospital.create({
		data: payload,
	});

	await redis.del(HOSPITAL_CACHE_KEY);
	return hospital;
};

const getHospitals = async () => {
	const cached = await redis.get(HOSPITAL_CACHE_KEY);
	if (cached) {
		return JSON.parse(cached);
	}

	const hospitals = await prisma.hospital.findMany({
		where: { deletedAt: null },
		orderBy: { availableBeds: "desc" },
	});

	await redis.set(HOSPITAL_CACHE_KEY, JSON.stringify(hospitals), "EX", 300);
	return hospitals;
};

const updateBeds = async (id: string, availableBeds: number) => {
	const hospital = await prisma.hospital.findFirst({
		where: { id, deletedAt: null },
	});

	if (!hospital) {
		throw new AppError(404, "Hospital not found");
	}

	const updated = await prisma.hospital.update({
		where: { id },
		data: { availableBeds },
	});

	await redis.del(HOSPITAL_CACHE_KEY);
	return updated;
};

const softDeleteHospital = async (id: string) => {
	const hospital = await prisma.hospital.findFirst({
		where: { id, deletedAt: null },
	});

	if (!hospital) {
		throw new AppError(404, "Hospital not found");
	}

	await prisma.hospital.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	await redis.del(HOSPITAL_CACHE_KEY);
};

export const HospitalService = {
	createHospital,
	getHospitals,
	updateBeds,
	softDeleteHospital,
};
