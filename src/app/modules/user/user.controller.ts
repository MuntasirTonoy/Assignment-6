import type { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../errors/AppError.js";

const syncUser = async (req: Request, res: Response): Promise<void> => {
	const clerkId = req.user?.clerkId;
	if (!clerkId) {
		throw new AppError(401, "Unauthorized Clerk session");
	}

	const result = await UserService.syncClerkUser(clerkId, req.body);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "User profile synchronized successfully",
		data: result,
	});
};

const getMe = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userId = req.user!.id;
	const result = await UserService.getMe(userId);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "User profile retrieved successfully",
		data: result,
	});
};

const updateMe = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userId = req.user!.id;
	const result = await UserService.updateMe(userId, req.body);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "User profile updated successfully",
		data: result,
	});
};

export const UserController = {
	syncUser,
	getMe,
	updateMe,
};
