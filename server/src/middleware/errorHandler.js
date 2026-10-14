import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to standard Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum allowed size is 5MB per image.',
    });
  }

  if (err.message && err.message.includes('Only JPEG, PNG, and WebP')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Zod validation errors (if thrown directly)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'The requested resource was not found.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.url}:`, err);

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
