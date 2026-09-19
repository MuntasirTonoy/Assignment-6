import { Role } from "@prisma/client";
import { z } from "zod";

export const syncUserSchema = z.object({
	body: z.object({
		email: z.string().email("Valid email is required"),
		name: z.string().min(2, "Name must be at least 2 characters"),
		phone: z.string().optional(),
		role: z.nativeEnum(Role).default(Role.PATIENT),
		licenseNumber: z.string().optional(), // Required if role is DRIVER
	}),
});

export const updateProfileSchema = z.object({
	body: z.object({
		name: z.string().min(2).optional(),
		phone: z.string().optional(),
	}),
});
