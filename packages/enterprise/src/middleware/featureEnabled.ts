import { Request, Response, NextFunction } from 'express';
import { OpenArchiverFeature } from '@open-archiver/types';
import { licenseService } from '../modules/license/LicenseService';
import { logger } from '@open-archiver/backend';

/**
 * Middleware factory to create a feature flag guard.
 * It checks if a specific enterprise feature is enabled for the current license.
 *
 * @param feature The enterprise feature to check.
 * @returns An Express middleware function.
 */
export const featureEnabled = (feature: OpenArchiverFeature) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (licenseService.isFeatureEnabled(feature)) {
                return next();
            }

            res.status(403).json({
                error: 'Forbidden',
                message: `This feature (${feature}) is not enabled for your current license. Please upgrade your plan to access this feature.`,
            });
        } catch (error) {
            // In case of an unexpected error during license verification,
            // log the error but allow the request to proceed.
            logger.error(`🚨 CRITICAL: License check failed for feature "${feature}". Allowing access by default. Error:`, error);
            return next();
        }
    };
};
