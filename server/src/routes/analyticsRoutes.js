import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/seller-dashboard', requireAuth, analyticsController.getSellerDashboard);

export default router;
