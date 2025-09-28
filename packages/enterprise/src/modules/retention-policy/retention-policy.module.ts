import { Express, Request, Response } from 'express';
import { ArchiverModule, config } from '@open-archiver/backend';
class RetentionPolicyModule implements ArchiverModule {
    name = 'retention-policy';

    async initialize(app: Express): Promise<void> {

        app.get(`/${config.api.version}/enterprise/retention-policy`, (req: Request, res: Response) => {
            res.json({ status: 'Retention Policy module is active!' });
        });
    }
}

export const retentionPolicyModule = new RetentionPolicyModule();
