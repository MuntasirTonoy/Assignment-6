import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@clerk/express';
import type { Role } from "@prisma/client";
import { env } from "../../config/index.js";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/AppError.js";

// Extend Express Request interface with User info
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				clerkId: string;
				email: string;
				role: Role;
			};
		}
	}
}

export const auth = (...requiredRoles: Role[]) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader?.startsWith("Bearer ")) {
				throw new AppError(
					401,
					"Unauthorized access: Missing or invalid token",
				);
			}

			const token = authHeader.split(" ")[1];
			const verifiedToken = await verifyToken(token, {
				secretKey: env.CLERK_SECRET_KEY,
			});

			if (!verifiedToken?.sub) {
				throw new AppError(401, "Unauthorized access: Invalid session");
			}

			// Fetch internal user
			const user = await prisma.user.findFirst({
				where: { clerkId: verifiedToken.sub, deletedAt: null },
			});

			if (!user) {
				throw new AppError(404, "User account not registered or deactivated");
			}

			if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
				throw new AppError(403, "Forbidden: Insufficient role permissions");
			}

			req.user = {
				id: user.id,
				clerkId: user.clerkId || verifiedToken.sub,
				email: user.email,
				role: user.role,
			};

			next();
		} catch (error) {
			next(error);
		}
	};
};
