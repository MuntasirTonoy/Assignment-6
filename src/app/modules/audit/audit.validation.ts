import { z } from "zod";

export const auditFilterSchema = z.object({
	query: z.object({
		page: z.string().optional(),
		limit: z.string().optional(),
		action: z.string().optional(),
		resource: z.string().optional(),
	}),
});
