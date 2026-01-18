import { validationResult } from 'express-validator';
import { sequelize } from '../config/database.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import StockAdjustment from '../models/StockAdjustment.js';
import ActivityLog from '../models/ActivityLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateReceipt } from '../services/invoiceGenerator.js';

export const createOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { items, customerId, paymentMethod, totalAmount, subtotal, taxAmount, discountAmount } = req.body;

        // Validate and update stock for each item
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });

            if (!product) {
                throw new AppError(`Product ${item.productId} not found`, 404);
            }

            if (product.stockQuantity < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name}`, 400);
            }

            // Reduce stock
            await product.update({
                stockQuantity: product.stockQuantity - item.quantity
            }, { transaction });

            // Create stock adjustment
            await StockAdjustment.create({
                productId: item.productId,
                adjustmentType: 'remove',
                quantity: item.quantity,
                previousQuantity: product.stockQuantity + item.quantity,
                newQuantity: product.stockQuantity,
                reason: 'Sale',
                performedBy: req.user.id
            }, { transaction });
        }

        // Create order
        const order = await Order.create({
            items,
            customerId,
            paymentMethod,
            totalAmount,
            subtotal,
            taxAmount,
            discountAmount,
            cashierId: req.user.id,
            paymentStatus: 'completed',
            status: 'completed'
        }, { transaction });

        // Update customer if provided
        if (customerId) {
            const customer = await Customer.findByPk(customerId, { transaction });
            if (customer) {
                await customer.update({
                    totalPurchases: parseFloat(customer.totalPurchases) + parseFloat(totalAmount),
                    lastPurchaseDate: new Date(),
                    loyaltyPoints: customer.loyaltyPoints + Math.floor(totalAmount / 10) // 1 point per ₹10
                }, { transaction });
            }
        }

        // Log activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'create',
            resource: 'order',
            resourceId: order.id,
            details: { totalAmount, itemCount: items.length },
            ipAddress: req.ip
        }, { transaction });

        await transaction.commit();
        res.status(201).json(order);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, paymentMethod, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (paymentMethod) where.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) where.orderDate[Op.gte] = new Date(startDate);
            if (endDate) where.orderDate[Op.lte] = new Date(endDate);
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
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

export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
};

export const refundOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const order = await Order.findByPk(req.params.id, { transaction });

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (order.status === 'refunded') {
            throw new AppError('Order already refunded', 400);
        }

        // Restore stock for each item
        for (const item of order.items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (product) {
                await product.update({
                    stockQuantity: product.stockQuantity + item.quantity
                }, { transaction });

                await StockAdjustment.create({
                    productId: item.productId,
                    adjustmentType: 'add',
                    quantity: item.quantity,
                    previousQuantity: product.stockQuantity - item.quantity,
                    newQuantity: product.stockQuantity,
                    reason: `Refund: ${order.orderNumber}`,
                    performedBy: req.user.id
                }, { transaction });
            }
        }

        // Update order status
        await order.update({
            status: 'refunded',
            paymentStatus: 'refunded'
        }, { transaction });

        // Update customer
        if (order.customerId) {
            const customer = await Customer.findByPk(order.customerId, { transaction });
            if (customer) {
                await customer.update({
                    totalPurchases: Math.max(0, parseFloat(customer.totalPurchases) - parseFloat(order.totalAmount)),
                    loyaltyPoints: Math.max(0, customer.loyaltyPoints - Math.floor(order.totalAmount / 10))
                }, { transaction });
            }
        }

        await ActivityLog.create({
            userId: req.user.id,
            action: 'refund',
            resource: 'order',
            resourceId: order.id,
            ipAddress: req.ip
        }, { transaction });

        await transaction.commit();
        res.json(order);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getReceipt = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        const pdfBuffer = await generateReceipt(order);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderNumber}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};
