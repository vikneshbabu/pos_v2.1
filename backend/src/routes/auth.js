import express from 'express';
import { body } from 'express-validator';
import { login, logout, refreshToken, getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], login);

// Logout
router.post('/logout', authenticate, logout);

// Refresh token
router.post('/refresh', refreshToken);

// Get current user
router.get('/me', authenticate, getCurrentUser);

export default router;
