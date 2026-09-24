import { Role } from "@prisma/client";
import { z } from "zod";

export const updateProfileSchema = z.object({
	body: z.object({
		name: z.string().min(2).optional(),
		phone: z.string().optional(),
	}),
});
