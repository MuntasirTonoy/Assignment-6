import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { logAuditEvent } from "../../utils/auditLogger.js";
import { env } from "../../../config/index.js";

const BKASH_BASE_URL = "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

// Helper to obtain bKash token
const getBkashToken = async () => {
	const response = await fetch(
		`${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				username: env.BKASH_USERNAME,
				password: env.BKASH_PASSWORD,
			},
			body: JSON.stringify({
				app_key: env.BKASH_APP_KEY,
				app_secret: env.BKASH_APP_SECRET,
			}),
		},
	);

	const data = await response.json();
	if (data.statusMessage !== "Successful") {
		throw new AppError(500, "Failed to authenticate with bKash API");
	}

	return data.id_token;
};

const initiatePayment = async (emergencyRequestId: string) => {
	const payment = await prisma.payment.findUnique({
		where: { emergencyRequestId },
	});

	if (!payment) {
		throw new AppError(404, "Payment record not found for this trip");
	}

	if (payment.status === PaymentStatus.PAID) {
		throw new AppError(400, "This trip has already been paid for");
	}

	// 1. Get Authentication Token
	const token = await getBkashToken();

	// 2. Create bKash Payment
	const createResponse = await fetch(
		`${BKASH_BASE_URL}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: token,
				"x-app-key": env.BKASH_APP_KEY,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: " ",
				// Ensure this points back to a route your frontend handles to call your /callback endpoint
				callbackURL: "http://localhost:5000/api/v1/payments/callback",
				amount: payment.amount.toString(),
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber: payment.id,
			}),
		},
	);

	const createData = await createResponse.json();

	if (createData.statusCode !== "0000") {
		throw new AppError(
			500,
			`bKash Create Payment Failed: ${createData.statusMessage}`,
		);
	}

	// 3. Save the bKash paymentID as the gatewayTransactionId to reference it later
	await prisma.payment.update({
		where: { id: payment.id },
		data: { gatewayTransactionId: createData.paymentID },
	});

	return {
		paymentId: payment.id,
		amount: payment.amount,
		bkashUrl: createData.bkashURL,
	};
};

const bkashCallback = async (payload: {
	paymentID: string;
	status: string;
}) => {
	const payment = await prisma.payment.findUnique({
		where: { gatewayTransactionId: payload.paymentID },
		include: { emergencyRequest: { include: { patient: true } } },
	});

	if (!payment) {
		throw new AppError(404, "Payment not found for this transaction");
	}

	if (payload.status === "success") {
		// 1. Get Token again to execute
		const token = await getBkashToken();

		// 2. Execute Payment
		const executeResponse = await fetch(
			`${BKASH_BASE_URL}/tokenized/checkout/execute`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: token,
					"x-app-key": env.BKASH_APP_KEY,
				},
				body: JSON.stringify({
					paymentID: payload.paymentID,
				}),
			},
		);

		const executeData = await executeResponse.json();

		// 0000 is successful, 2062 is already executed
		if (
			executeData.statusCode === "0000" ||
			executeData.statusCode === "2062"
		) {
			const updatedPayment = await prisma.payment.update({
				where: { id: payment.id },
				data: {
					status: PaymentStatus.PAID,
					gatewayTransactionId: executeData.trxID ?? payload.paymentID,
					paidAt: new Date(),
				},
			});

			await logAuditEvent({
				userId: payment.emergencyRequest.patient.id,
				action: "PAYMENT_RECEIVED",
				resource: `Payment:${payment.id}`,
				payload: {
					amount: Number(payment.amount),
					trxID: updatedPayment.gatewayTransactionId,
				},
			});

			return updatedPayment;
		}

		// Fall through to failure if execute fails
		return await prisma.payment.update({
			where: { id: payment.id },
			data: { status: PaymentStatus.FAILED },
		});
	}

	// If status is failure or cancel from the callback
	return await prisma.payment.update({
		where: { id: payment.id },
		data: { status: PaymentStatus.FAILED },
	});
};

export const PaymentService = {
	initiatePayment,
	bkashCallback,
};
