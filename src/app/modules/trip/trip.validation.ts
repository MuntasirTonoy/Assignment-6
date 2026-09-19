import { RequestStatus } from "@prisma/client";
import { z } from "zod";

export const updateTripStatusSchema = z.object({
	body: z
		.object({
			status: z.nativeEnum(RequestStatus),
			hospitalId: z.string().uuid().optional(),
			totalDistanceKm: z.number().positive().optional(),
		})
		.refine(
			(data) => {
				if (
					data.status === RequestStatus.COMPLETED &&
					data.totalDistanceKm === undefined
				) {
					return false;
				}
				return true;
			},
			{
				message: "totalDistanceKm is required when completing a trip",
				path: ["totalDistanceKm"],
			},
		),
});
