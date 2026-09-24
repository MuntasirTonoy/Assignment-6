import { z } from "zod";

export const registerSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(6),
		name: z.string(),
		phone: z.string().optional(),
		role: z.enum(["PATIENT", "DRIVER", "ADMIN"]).optional(),
		licenseNumber: z.string().optional(),
	}),
});

export const loginSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(1),
	}),
});
