import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import ActivityLog from '../models/ActivityLog.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllCustomers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
                { customerId: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Customer.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            customers: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        res.json(customer);
    } catch (error) {
        next(error);
    }
};

export const createCustomer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const customer = await Customer.create(req.body);

        await ActivityLog.create({
            userId: req.user.id,
            action: 'create',
            resource: 'customer',
            resourceId: customer.id,
            ipAddress: req.ip
        });

        res.status(201).json(customer);
    } catch (error) {
        next(error);
    }
};

export const updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        await customer.update(req.body);

        await ActivityLog.create({
            userId: req.user.id,
            action: 'update',
            resource: 'customer',
            resourceId: customer.id,
            details: req.body,
            ipAddress: req.ip
        });

        res.json(customer);
    } catch (error) {
        next(error);
    }
};

export const getCustomerOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Order.findAndCountAll({
            where: { customerId: req.params.id },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['orderDate', 'DESC']]
        });

        res.json({
            orders: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const updateLoyaltyPoints = async (req, res, next) => {
    try {
        const { points, operation } = req.body; // operation: 'add' or 'redeem'

        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        let newPoints = customer.loyaltyPoints;
        if (operation === 'add') {
            newPoints += points;
        } else if (operation === 'redeem') {
            if (customer.loyaltyPoints < points) {
                throw new AppError('Insufficient loyalty points', 400);
            }
            newPoints -= points;
        }

        await customer.update({ loyaltyPoints: newPoints });

        await ActivityLog.create({
            userId: req.user.id,
            action: 'loyalty_update',
            resource: 'customer',
            resourceId: customer.id,
            details: { operation, points, newPoints },
            ipAddress: req.ip
        });

        res.json(customer);
    } catch (error) {
        next(error);
    }
};
