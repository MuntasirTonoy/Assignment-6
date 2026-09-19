import { Router } from "express";
import { Role } from "@prisma/client";
import { EmergencyController } from "./emergency.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
	createEmergencySchema,
	dispatchEmergencySchema,
	emergencyFilterSchema,
} from "./emergency.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.PATIENT),
	validateRequest(createEmergencySchema),
	EmergencyController.createEmergency,
);

router.get(
	"/",
	auth(Role.ADMIN),
	validateRequest(emergencyFilterSchema),
	EmergencyController.getEmergencies,
);

router.get("/:id", auth(), EmergencyController.getEmergencyById);

router.post(
	"/:id/dispatch",
	auth(Role.ADMIN),
	validateRequest(dispatchEmergencySchema),
	EmergencyController.dispatchEmergency,
);

router.post(
	"/:id/cancel",
	auth(Role.PATIENT, Role.ADMIN),
	EmergencyController.cancelEmergency,
);

export const EmergencyRoutes = router;
