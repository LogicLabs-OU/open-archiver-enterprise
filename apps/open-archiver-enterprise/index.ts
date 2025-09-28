import { createServer, logger } from '@open-archiver/backend';
import { enterpriseModules } from '@open-archiver/enterprise';
import * as dotenv from 'dotenv';

dotenv.config();


async function start() {
    // --- Environment Variable Validation ---
    const { PORT_BACKEND } = process.env;

    if (!PORT_BACKEND) {
        throw new Error(
            'Missing required environment variables for the backend: PORT_BACKEND.'
        );
    }
    // Create the server instance (passing no modules for the default OSS version)
    const app = await createServer(enterpriseModules);

    app.listen(PORT_BACKEND, () => {
        logger.info({}, `🏢 Open Archiver (Enterprise) running on port ${PORT_BACKEND}`);
    });
}

start().catch(error => {
    logger.error({ error }, 'Failed to start the server:', error);
    process.exit(1);
});
