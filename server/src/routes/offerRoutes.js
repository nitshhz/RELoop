import { Router } from 'express';
import * as offerController from '../controllers/offerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOfferSchema, respondOfferSchema } from '../validators/offerSchemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createOfferSchema), offerController.createOffer);
router.post('/:id/respond', validate(respondOfferSchema), offerController.respondToOffer);
router.post('/:id/withdraw', offerController.withdrawOffer);
router.get('/my-offers', offerController.getMyOffers);

export default router;
