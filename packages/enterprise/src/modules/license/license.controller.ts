import { Request, Response } from 'express';
import { ConsolidatedLicenseStatus, OpenArchiverFeature } from '@open-archiver/types';
import { licenseService } from './LicenseService';
import { licenseReportingService } from './LicenseReportingService';

class LicenseController {
    public getLicenseStatus = async (req: Request, res: Response) => {
        if (!licenseService.licensePayload) {
            return res.status(404).json({ error: 'License information not found.' });
        }

        const activeSeats = await licenseReportingService.countActiveSeats()

        const allPossibleFeatures: OpenArchiverFeature[] = Object.values(OpenArchiverFeature);

        const features = allPossibleFeatures.reduce((acc, feature) => {
            acc[feature] = licenseService.isFeatureEnabled(feature);
            return acc;
        }, {} as { [key in OpenArchiverFeature]?: boolean });

        const response: ConsolidatedLicenseStatus = {
            customerName: licenseService.licensePayload.customerName,
            planSeats: licenseService.licensePayload.planSeats,
            expiresAt: licenseService.licensePayload.expiresAt,
            remoteStatus: licenseService.cachedStatus?.status || 'UNKNOWN',
            gracePeriodEnds: licenseService.cachedStatus?.gracePeriodEnds,
            activeSeats: activeSeats,
            isExpired: new Date(licenseService.licensePayload.expiresAt) < new Date(),
            features: features,
        };

        res.status(200).json(response);
    };
}

export const licenseController = new LicenseController();
