import { prisma } from "./prisma.js";

interface IAuditLogPayload {
	userId?: string | null;
	action: string;
	resource: string;
	// biome-ignore lint/suspicious/noExplicitAny: Required for flexible JSON payloads
	payload?: Record<string, any>;
}

export const logAuditEvent = async ({
	userId,
	action,
	resource,
	payload,
}: IAuditLogPayload): Promise<void> => {
	try {
		await prisma.auditLog.create({
			data: {
				userId: userId ?? null,
				action,
				resource,
				// biome-ignore lint/suspicious/noExplicitAny: JSON type mismatch in Prisma wrapper
				payload: payload ? (payload as any) : undefined,
			},
		});
	} catch (error) {
		console.error("Failed to persist audit log entry:", error);
	}
};
