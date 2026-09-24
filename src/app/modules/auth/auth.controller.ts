import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { AuthService } from "./auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const register = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const result = await AuthService.registerUser(req.body);
		sendResponse(res, {
			statusCode: 201,
			success: true,
			message: "User registered successfully",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

const login = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate(
		"local",
		{ session: false },
		(err: any, user: any, info: any) => {
			if (err) return next(err);
			if (!user) {
				return res
					.status(401)
					.json({
						success: false,
						message: info?.message || "Invalid credentials",
					});
			}

			const token = AuthService.generateToken(user);

			// @ts-expect-error
			delete user.passwordHash;

			sendResponse(res, {
				statusCode: 200,
				success: true,
				message: "Logged in successfully",
				data: { user, token },
			});
		},
	)(req, res, next);
};

const googleCallback = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate(
		"google",
		{ session: false },
		(err: any, user: any, info: any) => {
			if (err) return next(err);
			if (!user) {
				return res.redirect("/login?error=auth_failed");
			}

			const token = AuthService.generateToken(user);

			// Usually, we redirect to frontend with token, or return JSON if it's API.
			// Since it's a callback, redirecting is standard for OAuth.
			// We can return JSON here if it's tested via API, but let's just return the token.
			sendResponse(res, {
				statusCode: 200,
				success: true,
				message: "Google login successful",
				data: { user, token },
			});
		},
	)(req, res, next);
};

export const AuthController = {
	register,
	login,
	googleCallback,
};
