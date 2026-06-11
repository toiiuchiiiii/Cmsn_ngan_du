import { Router } from 'express';
import { AuthService } from '../../services/auth.service.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { authController } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../validators/auth.schema.js';

const router = Router();

const userRepo = new UserRepository();
const service = new AuthService(userRepo);
const controller = authController(service);

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/logout', authenticate, controller.logout);
router.post('/refresh', controller.refresh);
router.get('/me', authenticate, controller.getProfile);
router.put('/me', authenticate, controller.updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), controller.resetPassword);

export default router;
