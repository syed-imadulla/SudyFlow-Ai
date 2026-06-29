import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public auth endpoints protected by strict rate limiting
router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);
router.post('/refresh', authLimiter, AuthController.refresh);

// Status check endpoint (optional auth to return authenticated true/false)
router.get('/status', optionalAuth, AuthController.getStatus);

// Protected auth endpoints
router.use(authenticate); // Require authentication for all routes below

router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);
router.patch('/profile', validateUpdateProfile, AuthController.updateProfile);

export default router;
