import * as authService from '../services/authService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.cookie('reloop_token', token, COOKIE_OPTIONS);
    return apiSuccess(res, { user, token }, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.cookie('reloop_token', token, COOKIE_OPTIONS);
    return apiSuccess(res, { user, token }, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('reloop_token', COOKIE_OPTIONS);
  return apiSuccess(res, null, 'Logged out successfully.');
}

export async function getMe(req, res) {
  return apiSuccess(res, { user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateUserProfile(req.user.id, req.body);
    return apiSuccess(res, { user: updated }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return apiSuccess(res, null, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.params.userId);
    // Sanitize sensitive email and account details from public profile
    const publicProfile = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      stats: {
        listingsCount: user._count.listings,
      },
    };
    return apiSuccess(res, { user: publicProfile });
  } catch (err) {
    next(err);
  }
}
