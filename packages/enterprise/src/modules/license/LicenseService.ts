import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import {
	LicenseFilePayload,
	LicenseStatusPayload,
	OpenArchiverFeature,
} from '@open-archiver/types';
import { logger } from '@open-archiver/backend';
import { licenseReportingService } from './LicenseReportingService';
import { CACHE_FILE_PATH } from './LicenseReportingService';

// --- SECURITY BEST PRACTICE ---
// The public key is embedded directly into the code to prevent tampering.
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUusug3dvT36RcauKYmO5JtHxpSpi
X0SrmkMxGyEd18vMXBGD9piAR3MTRskQ6XOoEo0fio6s9LtgPzKkJBdyVg==
-----END PUBLIC KEY-----`;

type LicenseStatus = 'VALID' | 'INVALID' | 'EXPIRED' | 'NOT_FOUND';

class LicenseService {
	public licensePayload: LicenseFilePayload | null = null;
	public licenseStatus: LicenseStatus = 'NOT_FOUND';
	public cachedStatus: LicenseStatusPayload | null = null;

	constructor() {
		this.loadAndVerifyLicense();
		this.loadCachedStatus();
	}

	private loadAndVerifyLicense() {
		try {
			const licenseKey =
				process.env.OA_LICENSE_KEY ||
				fs.readFileSync(path.join(__dirname, 'license.jwt'), 'utf-8');

			if (!licenseKey) {
				this.licenseStatus = 'NOT_FOUND';
				logger.warn('📄 License key not found.');
				return;
			}

			const decoded = jwt.verify(licenseKey, PUBLIC_KEY, {
				algorithms: ['ES256'],
			}) as LicenseFilePayload;

			this.licensePayload = decoded;
			this.licenseStatus = 'VALID';
			logger.info(
				`Enterprise license successfully verified for: ${this.licensePayload.customerName}`
			);
			// Start the reporting service now that we have a valid license payload
			licenseReportingService.start(this.licensePayload);
		} catch (error) {
			if (error instanceof jwt.TokenExpiredError) {
				this.licenseStatus = 'EXPIRED';
				logger.error('License verification failed: The license has expired.');
			} else if (error instanceof jwt.JsonWebTokenError) {
				this.licenseStatus = 'INVALID';
				logger.error(`License verification failed: ${error.message}`);
			} else {
				this.licenseStatus = 'INVALID';
				logger.error('An unexpected error occurred during license verification:', error);
			}
		}
	}

	private async loadCachedStatus() {
		try {
			if (fs.existsSync(CACHE_FILE_PATH)) {
				const data = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
				this.cachedStatus = JSON.parse(data);
				logger.info(
					`Successfully loaded cached license status: ${this.cachedStatus?.status}`
				);
			} else {
				// On a new installation, the cache file won't exist. We default to a valid state
				logger.info(
					`License status cache not found. Assuming 'VALID' until first phone-home.`
				);
				this.cachedStatus = { status: 'VALID' };
			}
		} catch (error) {
			logger.error(`Failed to load or initialize cached license status:`, error);
			// Fallback to a valid status if parsing fails to prevent locking out users.
			this.cachedStatus = { status: 'VALID' };
		}
	}

	public isFeatureEnabled(feature: OpenArchiverFeature): boolean {
		// A license payload must exist to know which features are granted.
		if (!this.licensePayload) {
			return false;
		}

		// Check if the license is supposed to grant the feature.
		const hasAllFeatures = this.licensePayload.features.includes(OpenArchiverFeature.ALL);
		const hasSpecificFeature = this.licensePayload.features.includes(feature);

		if (!hasAllFeatures && !hasSpecificFeature) {
			return false;
		}

		// Now, check the validity. The server's cached status is the highest source of truth.
		if (this.cachedStatus?.status === 'REVOKED') {
			if (this.cachedStatus.gracePeriodEnds) {
				const gracePeriodEnd = new Date(this.cachedStatus.gracePeriodEnds);
				// The grace period is active, so the feature is enabled regardless of local JWT status.
				return new Date() < gracePeriodEnd;
			}
			// Revoked and no grace period.
			return false;
		}

		// If not revoked by the server, the local license JWT must be valid.
		return this.licenseStatus === 'VALID';
	}
}

export const licenseService = new LicenseService();
