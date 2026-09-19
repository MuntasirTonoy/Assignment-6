import { PaymentStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { logAuditEvent } from "../../utils/auditLogger.js";

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

	// Mock bKash URL generation since we don't have real sandbox execution environment
	const mockBkashUrl = `https://sandbox.bkash.com/payment?paymentID=mock_${payment.id}`;

	return {
		paymentId: payment.id,
		amount: payment.amount,
		bkashUrl: mockBkashUrl,
	};
};

const bkashCallback = async (payload: {
	paymentID: string;
	status: string;
	trxID?: string;
}) => {
	// Extract payment ID from mock (mock_UUID)
	const paymentId = payload.paymentID.replace("mock_", "");

	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: { emergencyRequest: { include: { patient: true } } },
	});

	if (!payment) {
		throw new AppError(404, "Payment not found");
	}

	if (payload.status === "success") {
		const updatedPayment = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: PaymentStatus.PAID,
				gatewayTransactionId: payload.trxID ?? `TRX_${Date.now()}`,
				paidAt: new Date(),
			},
		});

		// Log the audit event for successful payment
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

	// Handle failure/cancellation
	return await prisma.payment.update({
		where: { id: payment.id },
		data: { status: PaymentStatus.FAILED },
	});
};

export const PaymentService = {
	initiatePayment,
	bkashCallback,
};
