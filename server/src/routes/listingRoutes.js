import { Router } from 'express';
import * as listingController from '../controllers/listingController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  createListingSchema,
  updateListingSchema,
  listingStatusChangeSchema,
} from '../validators/listingSchemas.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, listingController.getPublicListings);
router.get('/:id', optionalAuth, listingController.getListingById);

// Protected routes
router.post(
  '/',
  requireAuth,
  upload.array('images', 5),
  validate(createListingSchema),
  listingController.createListing
);

router.put(
  '/:id',
  requireAuth,
  upload.array('images', 5),
  validate(updateListingSchema),
  listingController.updateListing
);

router.delete('/:id', requireAuth, listingController.deleteListing);
router.patch(
  '/:id/status',
  requireAuth,
  validate(listingStatusChangeSchema),
  listingController.changeListingStatus
);
router.get('/user/my-listings', requireAuth, listingController.getMyListings);

export default router;
