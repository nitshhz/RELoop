import * as analyticsService from '../services/analyticsService.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getSellerDashboard(req, res, next) {
  try {
    const data = await analyticsService.getSellerAnalytics(req.user.id);
    return apiSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
