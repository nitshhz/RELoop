import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

export default router;
