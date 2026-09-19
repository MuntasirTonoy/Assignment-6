import { Router } from "express";
import { Role } from "@prisma/client";
import { HospitalController } from "./hospital.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
	createHospitalSchema,
	updateBedsSchema,
} from "./hospital.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(createHospitalSchema),
	HospitalController.createHospital,
);
router.get("/", auth(), HospitalController.getHospitals);
router.patch(
	"/:id/beds",
	auth(Role.ADMIN, Role.DRIVER),
	validateRequest(updateBedsSchema),
	HospitalController.updateBeds,
);
router.delete("/:id", auth(Role.ADMIN), HospitalController.deleteHospital);

export const HospitalRoutes = router;
