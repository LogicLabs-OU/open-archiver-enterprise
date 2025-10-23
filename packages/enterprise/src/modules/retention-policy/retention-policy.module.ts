import { Express } from 'express';
import { ArchiverModule, AuthService, config } from '@open-archiver/backend';
import { OpenArchiverFeature } from '@open-archiver/types';
import { retentionPolicyRoutes } from './retention-policy.routes';

class RetentionPolicyModule implements ArchiverModule {
	name: OpenArchiverFeature = OpenArchiverFeature.RETENTION_POLICY;

	async initialize(app: Express, authService: AuthService): Promise<void> {
		app.use(
			`/${config.api.version}/enterprise/retention-policy`,
			retentionPolicyRoutes(authService)
		);
	}
}

export const retentionPolicyModule = new RetentionPolicyModule();
