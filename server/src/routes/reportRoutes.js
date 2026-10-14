import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReportSchema } from '../validators/reportSchemas.js';

const router = Router();

router.post('/', requireAuth, validate(createReportSchema), reportController.createReport);

export default router;
