import { Router } from "express";
import { Role } from "@prisma/client";
import { TripController } from "./trip.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { updateTripStatusSchema } from "./trip.validation.js";

const router = Router();

router.patch(
	"/:id/status",
	auth(Role.DRIVER, Role.ADMIN),
	validateRequest(updateTripStatusSchema),
	TripController.updateTripStatus,
);

export const TripRoutes = router;
