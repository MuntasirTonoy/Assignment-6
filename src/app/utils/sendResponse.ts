import type { Response } from "express";

interface IApiResponse<T> {
	statusCode: number;
	success: boolean;
	message: string;
	data?: T;
}

export const sendResponse = <T>(
	res: Response,
	payload: IApiResponse<T>,
): void => {
	res.status(payload.statusCode).json({
		success: payload.success,
		message: payload.message,
		data: payload.data ?? null,
	});
};
