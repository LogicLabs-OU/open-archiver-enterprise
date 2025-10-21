import { ArchiverModule } from '@open-archiver/backend';
import { retentionPolicyModule } from './modules/retention-policy/retention-policy.module';
import { auditLogModule } from './modules/audit-log/audit-log.module';
import { licenseModule } from './modules/license/license.module';

export const enterpriseModules: ArchiverModule[] = [
    licenseModule,
    retentionPolicyModule,
    auditLogModule
];
