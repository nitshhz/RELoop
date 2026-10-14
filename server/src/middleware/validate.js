import { apiError } from '../utils/apiResponse.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return apiError(res, 'Validation error', 400, errors);
      }
      return apiError(res, 'Invalid request data', 400);
    }
  };
}
