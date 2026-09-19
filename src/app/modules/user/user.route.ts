import { Router } from "express";
import { UserController } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { syncUserSchema, updateProfileSchema } from "./user.validation.js";

const router = Router();

router.post("/sync", validateRequest(syncUserSchema), UserController.syncUser);
router.get("/me", auth(), UserController.getMe);
router.patch(
	"/me",
	auth(),
	validateRequest(updateProfileSchema),
	UserController.updateMe,
);

export const UserRoutes = router;
