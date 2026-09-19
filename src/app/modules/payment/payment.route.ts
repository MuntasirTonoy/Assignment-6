import { Router } from "express";
import { Role } from "@prisma/client";
import { PaymentController } from "./payment.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import {
	initiatePaymentSchema,
	bkashCallbackSchema,
} from "./payment.validation.js";

const router = Router();

router.post(
	"/create",
	auth(Role.PATIENT),
	validateRequest(initiatePaymentSchema),
	PaymentController.initiatePayment,
);

// Webhook/Callback does not require user authentication, but valid schema
router.post(
	"/callback",
	validateRequest(bkashCallbackSchema),
	PaymentController.bkashCallback,
);

// bKash redirects back via GET
router.get("/callback", PaymentController.bkashCallback);

export const PaymentRoutes = router;
