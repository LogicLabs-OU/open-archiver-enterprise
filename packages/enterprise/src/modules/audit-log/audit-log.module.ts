import { Express } from 'express';
import { ArchiverModule } from '@open-archiver/backend';
import { auditLogRoutes } from './audit-log.routes';
import { AuthService } from '@open-archiver/backend';
import { config } from '@open-archiver/backend';
import { OpenArchiverFeature } from '@open-archiver/types';

class AuditLogModule implements ArchiverModule {
    name: OpenArchiverFeature = OpenArchiverFeature.AUDIT_LOG;

    async initialize(app: Express, authService: AuthService): Promise<void> {
        app.use(`/${config.api.version}/enterprise/audit-logs`, auditLogRoutes(authService));
    }
}

export const auditLogModule = new AuditLogModule();
