import type { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma.js";

const getAuditLogs = async (filters: {
	page?: number;
	limit?: number;
	action?: string;
	resource?: string;
}) => {
	const page = Number(filters.page) || 1;
	const limit = Number(filters.limit) || 20;
	const skip = (page - 1) * limit;

	const where: Prisma.AuditLogWhereInput = {
		...(filters.action && { action: filters.action }),
		...(filters.resource && { resource: filters.resource }),
	};

	const [data, total] = await Promise.all([
		prisma.auditLog.findMany({
			where,
			skip,
			take: limit,
			include: {
				user: { select: { id: true, name: true, email: true, role: true } },
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.auditLog.count({ where }),
	]);

	return {
		meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
		data,
	};
};

export const AuditService = {
	getAuditLogs,
};
