import { z } from "zod";

export const createHospitalSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Hospital name is required"),
		address: z.string().min(5, "Address is required"),
		latitude: z.number().min(-90).max(90),
		longitude: z.number().min(-180).max(180),
		availableBeds: z.number().int().nonnegative().default(0),
	}),
});

export const updateBedsSchema = z.object({
	body: z.object({
		availableBeds: z
			.number()
			.int()
			.nonnegative("Beds must be a non-negative integer"),
	}),
});
