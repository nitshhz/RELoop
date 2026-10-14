import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { resolveReportSchema } from '../validators/reportSchemas.js';

const router = Router();

// Strict security: requireAuth + requireAdmin (Test 2)
router.use(requireAuth, requireAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/listings/pending', adminController.getPendingListings);
router.post('/listings/:id/moderate', adminController.moderateListing);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/suspend', adminController.toggleUserSuspension);
router.get('/reports', adminController.getReports);
router.post('/reports/:id/resolve', validate(resolveReportSchema), adminController.resolveReport);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
