import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory, or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'reloop-default-development-jwt-secret-key-32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  STORAGE_TYPE: process.env.STORAGE_TYPE || 'local',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ADMIN_INITIAL_EMAIL: process.env.ADMIN_INITIAL_EMAIL || 'admin@reloop.dev',
  ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@ReLoop2026!',
};

// Startup verification
export function validateEnv() {
  const warnings = [];
  if (!env.DATABASE_URL) {
    warnings.push('DATABASE_URL is not set. Database features will require a valid Neon/PostgreSQL connection string.');
  }
  if (!env.GEMINI_API_KEY) {
    warnings.push('GEMINI_API_KEY is not set. AI Listing Creator will use graceful rule-based fallback.');
  }
  if (env.STORAGE_TYPE === 'cloudinary' && (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY)) {
    warnings.push('Cloudinary credentials missing; defaulting STORAGE_TYPE to local disk storage.');
    env.STORAGE_TYPE = 'local';
  }
  return warnings;
}
