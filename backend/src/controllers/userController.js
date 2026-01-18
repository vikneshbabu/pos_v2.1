import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, isActive, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (role) where.role = role;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            users: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.create(req.body);

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'create',
            resource: 'user',
            resourceId: user.id,
            ipAddress: req.ip
        });

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Prevent non-admin from changing roles
        if (req.user.role !== 'admin' && req.body.role) {
            throw new AppError('Only admins can change user roles', 403);
        }

        await user.update(req.body);

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'update',
            resource: 'user',
            resourceId: user.id,
            details: req.body,
            ipAddress: req.ip
        });

        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Prevent deleting yourself
        if (user.id === req.user.id) {
            throw new AppError('Cannot delete your own account', 400);
        }

        await user.destroy();

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'delete',
            resource: 'user',
            resourceId: user.id,
            ipAddress: req.ip
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getUserActivity = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await ActivityLog.findAndCountAll({
            where: { userId: req.params.id },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            activities: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};
