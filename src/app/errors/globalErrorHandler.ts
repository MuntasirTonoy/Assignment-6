import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";

export const globalErrorHandler = (
  // biome-ignore lint/suspicious/noExplicitAny: Express error handler needs any
  err: any,
  _req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	let statusCode = 500;
	let message = "Something went wrong";
	let errorSources: Array<{ path: string; message: string }> = [];

	if (err instanceof ZodError) {
		statusCode = 400;
		message = "Validation Error";
		errorSources = err.issues.map((issue) => ({
			path: issue.path.join("."),
			message: issue.message,
		}));
	} else if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errorSources = [{ path: "", message: err.message }];
	} else if (err instanceof Error) {
		message = err.message;
		errorSources = [{ path: "", message: err.message }];
	}

	res.status(statusCode).json({
		success: false,
		message,
		errors: errorSources,
	});
};
