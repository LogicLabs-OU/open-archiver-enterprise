import { Request, Response } from 'express';
import { AuditService } from '@open-archiver/backend';
import { AuditLogActions, AuditLogTargetTypes } from '@open-archiver/types';
import { z } from 'zod';

const getAuditLogsSchema = z.object({
	page: z.coerce.number().min(1).optional(),
	limit: z.coerce.number().min(1).max(100).optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	actor: z.string().optional(),
	action: z.enum(AuditLogActions).optional(),
	targetType: z.enum(AuditLogTargetTypes).optional(),
	sort: z.enum(['asc', 'desc']).optional(),
});

export class AuditLogController {
	private auditService = new AuditService();

	public getAuditLogs = async (req: Request, res: Response) => {
		try {
			const query = getAuditLogsSchema.parse(req.query);
			const result = await this.auditService.getAuditLogs(query);
			res.status(200).json(result);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: 'Invalid query parameters', errors: error.issues });
			}
			res.status(500).json({ message: 'Internal server error.' });
		}
	};

	public verifyAuditLog = async (req: Request, res: Response) => {
		const result = await this.auditService.verifyAuditLog();
		if (result.ok) {
			res.status(200).json(result);
		} else {
			res.status(500).json(result);
		}
	};
}
