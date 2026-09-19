import type { Request, Response } from "express";
import { EmergencyService } from "./emergency.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createEmergency = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const result = await EmergencyService.createEmergency(req.user!.id, req.body);
	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Emergency request created successfully",
		data: result,
	});
};

const getEmergencies = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/suspicious/noExplicitAny: Temporary bypass for query typings
	const result = await EmergencyService.getEmergencies(req.query as any);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency requests retrieved successfully",
		data: result,
	});
};

const getEmergencyById = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userId = req.user!.id;
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userRole = req.user!.role;

	const result = await EmergencyService.getEmergencyById(
		req.params.id as string,
		userId,
		userRole,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency request retrieved successfully",
		data: result,
	});
};

const dispatchEmergency = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const result = await EmergencyService.dispatchEmergency(
		req.params.id as string,
		req.body,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Ambulance dispatched successfully",
		data: result,
	});
};

const cancelEmergency = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userId = req.user!.id;
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userRole = req.user!.role;

	const result = await EmergencyService.cancelEmergency(
		req.params.id as string,
		userId,
		userRole,
	);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency request cancelled successfully",
		data: result,
	});
};

export const EmergencyController = {
	createEmergency,
	getEmergencies,
	getEmergencyById,
	dispatchEmergency,
	cancelEmergency,
};
