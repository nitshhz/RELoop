import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { apiError } from '../utils/apiResponse.js';

export async function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.reloop_token) {
      token = req.cookies.reloop_token;
    }

    if (!token) {
      return apiError(res, 'Authentication required. Please sign in.', 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return apiError(res, 'Invalid or expired session token.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        isSuspended: true,
        suspensionReason: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError(res, 'User account no longer exists.', 401);
    }

    if (user.isSuspended) {
      return apiError(
        res,
        `Your account has been suspended. Reason: ${user.suspensionReason || 'Terms violation'}`,
        403
      );
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return apiError(res, 'Session token expired. Please log in again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return apiError(res, 'Invalid authentication token.', 401);
    }
    return apiError(res, 'Authentication failed.', 401);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.reloop_token) {
      token = req.cookies.reloop_token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded && decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          bio: true,
          isSuspended: true,
        },
      });
      req.user = user && !user.isSuspended ? user : null;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}
