import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/generate-listing', requireAuth, aiLimiter, aiController.generateListing);

export default router;
