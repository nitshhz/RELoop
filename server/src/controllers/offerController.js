import * as offerService from '../services/offerService.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function createOffer(req, res, next) {
  try {
    const { listingId, amount } = req.body;
    const offer = await offerService.createOffer({
      buyerId: req.user.id,
      listingId,
      amount,
    });
    return apiSuccess(res, { offer }, 'Offer submitted successfully.', 201);
  } catch (err) {
    next(err);
  }
}

export async function respondToOffer(req, res, next) {
  try {
    const offerId = req.params.id;
    const { action, counterAmount } = req.body;

    const offer = await offerService.respondToOffer({
      userId: req.user.id,
      offerId,
      action,
      counterAmount,
    });

    return apiSuccess(res, { offer }, `Offer successfully ${action.toLowerCase()}ed.`);
  } catch (err) {
    next(err);
  }
}

export async function withdrawOffer(req, res, next) {
  try {
    const offerId = req.params.id;
    const offer = await offerService.withdrawOffer({
      buyerId: req.user.id,
      offerId,
    });
    return apiSuccess(res, { offer }, 'Offer withdrawn successfully.');
  } catch (err) {
    next(err);
  }
}

export async function getMyOffers(req, res, next) {
  try {
    const offers = await offerService.getUserOffers(req.user.id);
    return apiSuccess(res, offers);
  } catch (err) {
    next(err);
  }
}
