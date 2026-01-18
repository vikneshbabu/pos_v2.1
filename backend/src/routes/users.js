import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/rbac.js';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserActivity
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin/manager only)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), getAllUsers);

// Get user by ID
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), getUserById);

// Create user (admin only)
router.post('/', authorize(ROLES.ADMIN), [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
], createUser);

// Update user (admin/manager)
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), updateUser);

// Delete user (admin only)
router.delete('/:id', authorize(ROLES.ADMIN), deleteUser);

// Get user activity logs
router.get('/:id/activity', authorize(ROLES.ADMIN, ROLES.MANAGER), getUserActivity);

export default router;
