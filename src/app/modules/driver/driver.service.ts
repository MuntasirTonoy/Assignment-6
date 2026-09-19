import { prisma } from "../../utils/prisma.js";
import { redis } from "../../utils/redis.js";
import { AppError } from "../../errors/AppError.js";

const DRIVERS_GEO_KEY = "drivers:locations";

const updateStatusAndLocation = async (
	userId: string,
	payload: { isAvailable?: boolean; currentLat?: number; currentLng?: number },
) => {
	const driver = await prisma.driverProfile.findUnique({
		where: { userId },
	});

	if (!driver) {
		throw new AppError(404, "Driver profile not found");
	}

	const updatedDriver = await prisma.driverProfile.update({
		where: { id: driver.id },
		data: {
			isAvailable: payload.isAvailable ?? driver.isAvailable,
			currentLat: payload.currentLat ?? driver.currentLat,
			currentLng: payload.currentLng ?? driver.currentLng,
		},
	});

	// Redis Geospatial synchronization
	if (payload.currentLat !== undefined && payload.currentLng !== undefined) {
		if (updatedDriver.isAvailable) {
			// Add or update coordinate in Redis Geo set: GEOADD key longitude latitude member
			await redis.geoadd(
				DRIVERS_GEO_KEY,
				payload.currentLng,
				payload.currentLat,
				driver.id,
			);
		} else {
			// Remove driver from dispatch pool if unavailable
			await redis.zrem(DRIVERS_GEO_KEY, driver.id);
		}
	} else if (payload.isAvailable === false) {
		await redis.zrem(DRIVERS_GEO_KEY, driver.id);
	}

	return updatedDriver;
};

export const DriverService = {
	updateStatusAndLocation,
};
