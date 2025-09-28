import { Express, Request, Response } from 'express';
import { ArchiverModule, config } from '@open-archiver/backend';
import { LicenseService } from '../license/LicenseService';

class StatusModule implements ArchiverModule {
    name = 'Status';

    async initialize(app: Express): Promise<void> {
        const licenseService = new LicenseService();

        app.get(`/${config.api.version}/enterprise/status`, (req: Request, res: Response) => {
            if (licenseService.isFeatureEnabled('enterprise-status')) {
                res.json({ status: 'Enterprise features are enabled!' });
            } else {
                res.status(403).json({ error: 'Enterprise license required.' });
            }
        });
    }
}

export const statusModule = new StatusModule();
