import { Router } from 'express';
import { AuditLogController } from './audit-log.controller';
import { requireAuth, requirePermission } from '@open-archiver/backend';
import { AuthService } from '@open-archiver/backend';
import { featureEnabled } from '../../middleware/featureEnabled';
import { OpenArchiverFeature } from '@open-archiver/types';



export const auditLogRoutes = (authService: AuthService): Router => {
    const router = Router();
    const controller = new AuditLogController();
    router.use(requireAuth(authService), featureEnabled(OpenArchiverFeature.AUDIT_LOG));

    router.get('/',
        requirePermission('manage', 'all'),
        controller.getAuditLogs);

    router.post('/verify',
        requirePermission('manage', 'all'),
        controller.verifyAuditLog);

    return router;
};
