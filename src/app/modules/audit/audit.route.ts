import { Router } from "express";
import { Role } from "@prisma/client";
import { AuditController } from "./audit.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { auditFilterSchema } from "./audit.validation.js";

const router = Router();

router.get(
	"/",
	auth(Role.ADMIN),
	validateRequest(auditFilterSchema),
	AuditController.getAuditLogs,
);

export const AuditRoutes = router;
