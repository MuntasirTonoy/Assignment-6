import { z } from "zod";

export const initiatePaymentSchema = z.object({
	body: z.object({
		emergencyRequestId: z
			.string()
			.uuid("Valid emergency request UUID is required"),
	}),
});

export const bkashCallbackSchema = z.object({
	body: z.object({
		paymentID: z.string().min(1, "Payment ID is required"),
		status: z.string().min(1, "Status is required"),
		trxID: z.string().optional(),
	}),
});
