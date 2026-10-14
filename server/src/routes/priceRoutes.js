import { Router } from 'express';
import * as priceController from '../controllers/priceController.js';

const router = Router();

router.get('/suggestions', priceController.getSuggestions);

export default router;
