import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { checkDatabaseConnection } from './config/prisma.js';

const warnings = validateEnv();
if (warnings.length > 0) {
  console.log('\n--- ReLoop Server Environment Notice ---');
  warnings.forEach(w => console.log(`• ${w}`));
  console.log('----------------------------------------\n');
}

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 ReLoop Backend API running on http://localhost:${env.PORT}`);
  console.log(`🌐 CORS enabled for: ${env.CLIENT_URL}`);
  console.log(`📁 Image storage mode: ${env.STORAGE_TYPE}`);

  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    console.log(`✅ PostgreSQL database connected successfully.`);
  } else {
    console.log(`⚠️ Database not connected. (Ensure DATABASE_URL is set in .env with a valid Neon connection)`);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
