import { Router } from 'express';
import { AuditLogController } from './audit-log.controller';
import { requireAuth } from '@open-archiver/backend';
import { AuthService } from '@open-archiver/backend';

export const auditLogRoutes = (authService: AuthService): Router => {
    const router = Router();
    const controller = new AuditLogController();

    router.get('/', requireAuth(authService), controller.getAuditLogs);
    router.post('/verify', requireAuth(authService), controller.verifyAuditLog);

    return router;
};
