import * as cron from 'node-cron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LicenseFilePayload, LicenseStatusPayload } from '@open-archiver/types';
import { logger, db, drizzleOrm, archivedEmails } from '@open-archiver/backend';

// license server is yet to be implemented.
const LICENSE_SERVER_URL = 'https://licensing.openarchiver.com/api/v1/ping';
export const CACHE_FILE_PATH = path.join(__dirname, 'license-status.json');

class LicenseReportingService {
	private licensePayload: LicenseFilePayload | null = null;

	public start(payload: LicenseFilePayload) {
		this.licensePayload = payload;
		// Schedule to run once every 24 hours, with a random minute/hour to distribute load.
		const cronExpression = `${Math.floor(Math.random() * 60)} ${Math.floor(Math.random() * 5)} * * *`;

		cron.schedule(cronExpression, () => {
			this.phoneHome();
		});

		logger.info(`📞 License reporting service scheduled with expression: ${cronExpression}`);
	}

	public async phoneHome() {
		if (!this.licensePayload) {
			logger.warn('📞 Phone home skipped: License payload not loaded.');
			return;
		}

		try {
			// 1. Count Active Seats, the result will be used to send to license server.
			const activeSeats = await this.countActiveSeats();

			logger.info(
				`Performing daily license check for ${this.licensePayload.customerName}. Active seats: ${activeSeats}`
			);

			// 2. Phone Home (mocked for now)
			// will be replaced by a fetch call to the license server.
			const mockedResponse: LicenseStatusPayload = {
				status: 'VALID',
			};

			// 3. Cache Response
			await this.cacheLicenseStatus(mockedResponse);
		} catch (error) {
			logger.error('Phone home failed:', error);
			// If the request fails, we do nothing and the app continues with the last known status.
		}
	}

	public async countActiveSeats(): Promise<number> {
		try {
			const result = await db
				.select({ count: drizzleOrm.countDistinct(archivedEmails.userEmail) })
				.from(archivedEmails);

			return result[0]?.count || 0;
		} catch (error) {
			logger.error('Failed to count active seats from database:', error);
			return 0; // Return 0 if the query fails to avoid breaking the process.
		}
	}

	private async cacheLicenseStatus(status: LicenseStatusPayload) {
		try {
			await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(status, null, 2));
			logger.info(`License status successfully cached to ${CACHE_FILE_PATH}`);
		} catch (error) {
			logger.error(`Failed to cache license status to ${CACHE_FILE_PATH}:`, error);
		}
	}
}

export const licenseReportingService = new LicenseReportingService();
