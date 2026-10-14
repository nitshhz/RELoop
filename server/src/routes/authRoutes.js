import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/authSchemas.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);
router.get('/user/:userId', authController.getPublicProfile);

export default router;
