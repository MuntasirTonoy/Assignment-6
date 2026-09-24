import { Router } from "express";
import passport from "passport";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post(
	"/register",
	validateRequest(registerSchema),
	AuthController.register,
);
router.post("/login", validateRequest(loginSchema), AuthController.login);

// Google OAuth
router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get("/google/callback", AuthController.googleCallback);

export const AuthRoutes = router;
