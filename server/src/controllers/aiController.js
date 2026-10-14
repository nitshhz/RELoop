import { generateListingWithAI } from '../services/geminiService.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function generateListing(req, res, next) {
  try {
    const input = {
      productName: req.body.productName,
      brand: req.body.brand,
      model: req.body.model,
      condition: req.body.condition,
      specifications: req.body.specifications,
      knownDefects: req.body.knownDefects,
      includedAccessories: req.body.includedAccessories,
      additionalDetails: req.body.additionalDetails,
      categoryHint: req.body.categoryHint,
    };

    const result = await generateListingWithAI(input);
    return apiSuccess(res, result, 'AI listing content generated successfully.');
  } catch (err) {
    next(err);
  }
}
