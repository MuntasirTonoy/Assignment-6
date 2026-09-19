import type { Request, Response } from "express";
import { TripService } from "./trip.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const updateTripStatus = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/style/noNonNullAssertion: Auth middleware guarantees user object
	const userId = req.user!.id;
	const result = await TripService.updateTripStatus(
		req.params.id as string,
		userId,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Trip status updated successfully",
		data: result,
	});
};

export const TripController = {
	updateTripStatus,
};
