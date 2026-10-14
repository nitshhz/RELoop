import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'USER', // Always default to USER
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  });

  const token = generateToken(user);
  return { user, token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (user.isSuspended) {
    const error = new Error(`Account suspended: ${user.suspensionReason || 'Violation of terms.'}`);
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };

  const token = generateToken(safeUser);
  return { user: safeUser, token };
}

export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      isSuspended: true,
      createdAt: true,
      _count: {
        select: {
          listings: true,
          offersMade: true,
          offersReceived: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

export async function updateUserProfile(userId, data) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  });

  return updated;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Incorrect current password.');
    error.statusCode = 400;
    throw error;
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  return true;
}

// In-memory token store for password reset with 15-minute expiry
const resetTokens = new Map();

export async function requestPasswordReset(email) {
  if (!email) {
    const error = new Error('Email address is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return {
      message: 'If an account exists with this email, instructions have been sent.',
    };
  }

  // Generate 6-digit verification code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  resetTokens.set(normalized, {
    code: resetCode,
    expiresAt,
    userId: user.id,
  });

  console.log(`[ReLoop Password Reset] Reset code for ${normalized}: ${resetCode}`);

  return {
    message: 'Reset code generated. Enter the code and your new password.',
    resetCode, // provided for seamless user testing
  };
}

export async function resetPasswordWithCode(email, code, newPassword) {
  if (!email || !code || !newPassword) {
    const error = new Error('Email, verification code, and new password are required.');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error('Password must be at least 8 characters long.');
    error.statusCode = 400;
    throw error;
  }

  const normalized = email.toLowerCase().trim();
  const record = resetTokens.get(normalized);

  if (!record || record.code !== code.trim()) {
    const error = new Error('Invalid or expired password reset code.');
    error.statusCode = 400;
    throw error;
  }

  if (Date.now() > record.expiresAt) {
    resetTokens.delete(normalized);
    const error = new Error('Reset code has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash: newHash },
  });

  resetTokens.delete(normalized);
  return { message: 'Password reset successfully. You can now log in.' };
}
