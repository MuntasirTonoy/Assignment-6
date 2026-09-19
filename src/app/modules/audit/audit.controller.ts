import type { Request, Response } from "express";
import { AuditService } from "./audit.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
	// biome-ignore lint/suspicious/noExplicitAny: Temporary bypass for query typings
	const result = await AuditService.getAuditLogs(req.query as any);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Audit logs retrieved successfully",
		data: result,
	});
};

export const AuditController = {
	getAuditLogs,
};
