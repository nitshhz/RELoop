import * as priceService from '../services/priceService.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getSuggestions(req, res, next) {
  try {
    const { categoryId, brand, condition } = req.query;
    const result = await priceService.getPriceSuggestions({
      categoryId,
      brand,
      condition,
    });
    return apiSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
