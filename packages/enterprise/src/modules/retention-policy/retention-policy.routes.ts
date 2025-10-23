import { Router } from 'express';
import { requireAuth, AuthService } from '@open-archiver/backend';
import { featureEnabled } from '../../middleware/featureEnabled';
import { OpenArchiverFeature } from '@open-archiver/types';

export const retentionPolicyRoutes = (authService: AuthService): Router => {
	const router = Router();

	// All routes in this module require authentication and the retention-policy feature
	router.use(requireAuth(authService), featureEnabled(OpenArchiverFeature.RETENTION_POLICY));

	// demonstrating route
	router.get('/', (req, res) => {
		res.status(200).json({ message: 'Retention policy feature is enabled.' });
	});

	return router;
};
