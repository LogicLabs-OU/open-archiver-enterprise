import { ArchiverModule } from '@open-archiver/backend';
import { statusModule } from './modules/status/status.module';
import { retentionPolicyModule } from './modules/retention-policy/retention-policy.module';

export const enterpriseModules: ArchiverModule[] = [
    statusModule,
    retentionPolicyModule,
];
