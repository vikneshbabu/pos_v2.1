import { verifyToken } from '../config/jwt.js';
import { AppError } from './errorHandler.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw new AppError('User not found', 401);
        }

        if (!user.isActive) {
            throw new AppError('User account is inactive', 403);
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
