import { validationResult } from 'express-validator';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateToken, generateRefreshToken, verifyToken } from '../config/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError('Account is inactive', 403);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Log activity
        await ActivityLog.create({
            userId: user.id,
            action: 'login',
            resource: 'auth',
            ipAddress: req.ip
        });

        // Generate tokens
        const token = generateToken({ id: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user.id });

        res.json({
            token,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'logout',
            resource: 'auth',
            ipAddress: req.ip
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token required', 400);
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        // Get user
        const user = await User.findByPk(decoded.id);
        if (!user || !user.isActive) {
            throw new AppError('Invalid refresh token', 401);
        }

        // Generate new tokens
        const newToken = generateToken({ id: user.id, role: user.role });
        const newRefreshToken = generateRefreshToken({ id: user.id });

        res.json({
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
};
