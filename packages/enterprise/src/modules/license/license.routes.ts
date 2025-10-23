import { Router } from 'express';
import { licenseController } from './license.controller';
import { requireAuth, AuthService } from '@open-archiver/backend';

export const licenseRoutes = (authService: AuthService): Router => {
	const router = Router();
	router.use(requireAuth(authService));

	router.get('/license-status', licenseController.getLicenseStatus);

	return router;
};
