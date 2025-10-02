import { ArchiverModule } from '@open-archiver/backend';
import { statusModule } from './modules/status/status.module';
import { retentionPolicyModule } from './modules/retention-policy/retention-policy.module';
import { auditLogModule } from './modules/audit-log/audit-log.module';

export const enterpriseModules: ArchiverModule[] = [
    statusModule,
    retentionPolicyModule,
    auditLogModule
];
