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
	const result = await PaymentService.bkashCallback(req.body);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: `Payment callback processed: ${req.body.status}`,
		data: result,
	});
};

export const PaymentController = {
	initiatePayment,
	bkashCallback,
};
