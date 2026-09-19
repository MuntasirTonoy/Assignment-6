import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});
			next();
		} catch (error) {
			next(error);
		}
	};
};
