import { Router } from 'express';
import * as savedController from '../controllers/savedController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/toggle', savedController.toggleSaveListing);
router.get('/', savedController.getSavedListings);
router.get('/recently-viewed', savedController.getRecentlyViewed);
router.post('/searches', savedController.saveSearch);
router.get('/searches', savedController.getSavedSearches);
router.delete('/searches/:id', savedController.deleteSavedSearch);

export default router;
