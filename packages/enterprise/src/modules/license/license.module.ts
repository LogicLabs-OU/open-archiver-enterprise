import { Express } from 'express';
import { ArchiverModule, AuthService, config } from '@open-archiver/backend';
import { licenseRoutes } from './license.routes';
import { OpenArchiverFeature } from '@open-archiver/types';

class LicenseModule implements ArchiverModule {
    name: OpenArchiverFeature = OpenArchiverFeature.STATUS;

    async initialize(app: Express, authService: AuthService): Promise<void> {
        app.use(`/${config.api.version}/enterprise/status`, licenseRoutes(authService));
    }
}

export const licenseModule = new LicenseModule();
