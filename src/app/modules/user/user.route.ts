import { Router } from "express";
import { UserController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateProfileSchema } from "./user.validation.js";

const router = Router();

router.get("/me", auth(), UserController.getMe);
router.patch(
	"/me",
	auth(),
	validateRequest(updateProfileSchema),
	UserController.updateMe,
);

export const UserRoutes = router;
