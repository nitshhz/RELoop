import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

let prismaInstance = null;

export function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/reloop',
        },
      },
      log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
}

export const prisma = getPrisma();

export async function checkDatabaseConnection() {
  try {
    if (!env.DATABASE_URL) return false;
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    return false;
  }
}
