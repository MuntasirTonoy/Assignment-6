import type { Request, Response } from "express";
import { PaymentService } from "./payment.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const initiatePayment = async (req: Request, res: Response): Promise<void> => {
	const result = await PaymentService.initiatePayment(
		req.body.emergencyRequestId,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "bKash payment initiated successfully",
		data: result,
	});
};

const bkashCallback = async (req: Request, res: Response): Promise<void> => {
	// bKash redirects via GET with query params, or frontend might POST it.
	const payload = Object.keys(req.query).length > 0 ? req.query : req.body;
	// biome-ignore lint/suspicious/noExplicitAny: Express query/body merging
	const result = await PaymentService.bkashCallback(payload as any);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: `Payment callback processed: ${payload.status}`,
		data: result,
	});
};

export const PaymentController = {
	initiatePayment,
	bkashCallback,
};
