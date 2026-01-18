import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category, isActive, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (category) where.category = category;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { sku: { [Op.iLike]: `%${search}%` } },
                { barcode: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
        });

        res.json({
            products: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const getProductByBarcode = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            where: { barcode: req.params.barcode }
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.create(req.body);

        await ActivityLog.create({
            userId: req.user.id,
            action: 'create',
            resource: 'product',
            resourceId: product.id,
            ipAddress: req.ip
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        await product.update(req.body);

        await ActivityLog.create({
            userId: req.user.id,
            action: 'update',
            resource: 'product',
            resourceId: product.id,
            details: req.body,
            ipAddress: req.ip
        });

        res.json(product);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        await product.destroy();

        await ActivityLog.create({
            userId: req.user.id,
            action: 'delete',
            resource: 'product',
            resourceId: product.id,
            ipAddress: req.ip
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getLowStockProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: {
                stockQuantity: {
                    [Op.lte]: Product.sequelize.col('min_stock_level')
                },
                isActive: true
            },
            order: [['stockQuantity', 'ASC']]
        });

        res.json(products);
    } catch (error) {
        next(error);
    }
};
