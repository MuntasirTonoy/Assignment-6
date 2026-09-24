import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import type { Role } from "@prisma/client";
import { AppError } from "../errors/AppError.js";

// Extend Express Request interface with User info
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: Role;
				[key: string]: any;
			};
		}
	}
}

export const auth = (...requiredRoles: Role[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		passport.authenticate(
			"jwt",
			{ session: false },
			(err: any, user: any, info: any) => {
				if (err) {
					return next(err);
				}

				if (!user) {
					return next(
						new AppError(401, "Unauthorized access: Missing or invalid token"),
					);
				}

				if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
					return next(
						new AppError(403, "Forbidden: Insufficient role permissions"),
					);
				}

				req.user = user;
				next();
			},
		)(req, res, next);
	};
};
