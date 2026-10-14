import { apiError } from '../utils/apiResponse.js';

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return apiError(res, 'Authentication required.', 401);
  }
  if (req.user.role !== 'ADMIN') {
    return apiError(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
}
