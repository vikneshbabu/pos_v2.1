import { validationResult } from 'express-validator';
import { sequelize } from '../config/database.js';
import Product from '../models/Product.js';
import StockAdjustment from '../models/StockAdjustment.js';
import { Purchase } from '../models/Supplier.js';
import ActivityLog from '../models/ActivityLog.js';
import { AppError } from '../middleware/errorHandler.js';

export const adjustStock = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, adjustmentType, quantity, reason } = req.body;

        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const previousQuantity = product.stockQuantity;
        let newQuantity;

        switch (adjustmentType) {
            case 'add':
                newQuantity = previousQuantity + quantity;
                break;
            case 'remove':
                newQuantity = Math.max(0, previousQuantity - quantity);
                break;
            case 'set':
                newQuantity = quantity;
                break;
        }

        // Update product stock
        await product.update({ stockQuantity: newQuantity }, { transaction });

        // Create adjustment record
        const adjustment = await StockAdjustment.create({
            productId,
            adjustmentType,
            quantity,
            previousQuantity,
            newQuantity,
            reason,
            performedBy: req.user.id
        }, { transaction });

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'stock_adjustment',
            resource: 'inventory',
            resourceId: productId,
            details: { adjustmentType, quantity, reason },
            ipAddress: req.ip
        }, { transaction });

        await transaction.commit();

        res.json({
            adjustment,
            product: {
                id: product.id,
                name: product.name,
                previousStock: previousQuantity,
                newStock: newQuantity
            }
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getStockHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await StockAdjustment.findAndCountAll({
            where: { productId: req.params.productId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            history: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const createPurchase = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const purchase = await Purchase.create(req.body, { transaction });

        await ActivityLog.create({
            userId: req.user.id,
            action: 'create',
            resource: 'purchase',
            resourceId: purchase.id,
            ipAddress: req.ip
        }, { transaction });

        await transaction.commit();
        res.status(201).json(purchase);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getAllPurchases = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const { count, rows } = await Purchase.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['purchaseDate', 'DESC']]
        });

        res.json({
            purchases: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        next(error);
    }
};

export const receivePurchase = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const purchase = await Purchase.findByPk(req.params.id, { transaction });

        if (!purchase) {
            throw new AppError('Purchase not found', 404);
        }

        if (purchase.status === 'received') {
            throw new AppError('Purchase already received', 400);
        }

        // Update stock for each item
        for (const item of purchase.items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                await product.update({
                    stockQuantity: product.stockQuantity + item.quantity,
                    costPrice: item.costPrice
                }, { transaction });

                // Create stock adjustment record
                await StockAdjustment.create({
                    productId: item.productId,
                    adjustmentType: 'add',
                    quantity: item.quantity,
                    previousQuantity: product.stockQuantity - item.quantity,
                    newQuantity: product.stockQuantity,
                    reason: `Purchase received: ${purchase.purchaseNumber}`,
                    performedBy: req.user.id
                }, { transaction });
            }
        }

        // Update purchase status
        await purchase.update({
            status: 'received',
            receivedDate: new Date()
        }, { transaction });

        await ActivityLog.create({
            userId: req.user.id,
            action: 'receive',
            resource: 'purchase',
            resourceId: purchase.id,
            ipAddress: req.ip
        }, { transaction });

        await transaction.commit();
        res.json(purchase);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};
