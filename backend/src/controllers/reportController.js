import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { generateReportPDF, generateReportExcel } from '../services/reportGenerator.js';

export const getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const where = { status: 'completed' };
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) where.orderDate[Op.gte] = new Date(startDate);
            if (endDate) where.orderDate[Op.lte] = new Date(endDate);
        }

        // Get total sales
        const totalSales = await Order.sum('totalAmount', { where });
        const totalOrders = await Order.count({ where });

        // Get sales by payment method
        const salesByPayment = await Order.findAll({
            where,
            attributes: [
                'paymentMethod',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            group: ['paymentMethod']
        });

        // Get daily/monthly sales
        let dateFormat;
        if (groupBy === 'day') {
            dateFormat = sequelize.fn('DATE', sequelize.col('order_date'));
        } else if (groupBy === 'month') {
            dateFormat = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('order_date'));
        }

        const salesOverTime = await Order.findAll({
            where,
            attributes: [
                [dateFormat, 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
            ],
            group: [dateFormat],
            order: [[dateFormat, 'ASC']]
        });

        res.json({
            summary: {
                totalSales: totalSales || 0,
                totalOrders: totalOrders || 0,
                averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders) : 0
            },
            salesByPayment,
            salesOverTime
        });
    } catch (error) {
        next(error);
    }
};

export const getProfitReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const where = { status: 'completed' };
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) where.orderDate[Op.gte] = new Date(startDate);
            if (endDate) where.orderDate[Op.lte] = new Date(endDate);
        }

        const orders = await Order.findAll({ where });

        let totalRevenue = 0;
        let totalCost = 0;

        for (const order of orders) {
            totalRevenue += parseFloat(order.totalAmount);

            // Calculate cost from order items
            for (const item of order.items) {
                const product = await Product.findByPk(item.productId);
                if (product) {
                    totalCost += parseFloat(product.costPrice) * item.quantity;
                }
            }
        }

        const profit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        res.json({
            totalRevenue,
            totalCost,
            profit,
            profitMargin: profitMargin.toFixed(2)
        });
    } catch (error) {
        next(error);
    }
};

export const getTaxReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const where = { status: 'completed' };
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) where.orderDate[Op.gte] = new Date(startDate);
            if (endDate) where.orderDate[Op.lte] = new Date(endDate);
        }

        const totalTax = await Order.sum('taxAmount', { where });
        const totalSales = await Order.sum('totalAmount', { where });

        res.json({
            totalTax: totalTax || 0,
            totalSales: totalSales || 0,
            averageTaxRate: totalSales > 0 ? ((totalTax / totalSales) * 100).toFixed(2) : 0
        });
    } catch (error) {
        next(error);
    }
};

export const getInventoryReport = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: { isActive: true }
        });

        let totalValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        const inventoryData = products.map(product => {
            const value = parseFloat(product.costPrice) * product.stockQuantity;
            totalValue += value;

            if (product.stockQuantity === 0) outOfStockCount++;
            else if (product.stockQuantity <= product.minStockLevel) lowStockCount++;

            return {
                id: product.id,
                name: product.name,
                sku: product.sku,
                stockQuantity: product.stockQuantity,
                minStockLevel: product.minStockLevel,
                costPrice: product.costPrice,
                value: value.toFixed(2),
                status: product.stockQuantity === 0 ? 'out_of_stock' :
                    product.stockQuantity <= product.minStockLevel ? 'low_stock' : 'in_stock'
            };
        });

        res.json({
            summary: {
                totalProducts: products.length,
                totalValue: totalValue.toFixed(2),
                lowStockCount,
                outOfStockCount
            },
            inventory: inventoryData
        });
    } catch (error) {
        next(error);
    }
};

export const getCashDrawerReport = async (req, res, next) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const where = {
            orderDate: {
                [Op.gte]: startOfDay,
                [Op.lte]: endOfDay
            },
            status: 'completed'
        };

        // Get totals by payment method
        const cashSales = await Order.sum('totalAmount', {
            where: { ...where, paymentMethod: 'cash' }
        });

        const cardSales = await Order.sum('totalAmount', {
            where: { ...where, paymentMethod: 'card' }
        });

        const upiSales = await Order.sum('totalAmount', {
            where: { ...where, paymentMethod: 'upi' }
        });

        const walletSales = await Order.sum('totalAmount', {
            where: { ...where, paymentMethod: 'wallet' }
        });

        const totalSales = await Order.sum('totalAmount', { where });
        const totalOrders = await Order.count({ where });

        res.json({
            date,
            cash: cashSales || 0,
            card: cardSales || 0,
            upi: upiSales || 0,
            wallet: walletSales || 0,
            total: totalSales || 0,
            orderCount: totalOrders
        });
    } catch (error) {
        next(error);
    }
};

export const exportReportPDF = async (req, res, next) => {
    try {
        const { type, ...params } = req.query;

        let reportData;
        switch (type) {
            case 'sales':
                reportData = await getSalesReportData(params);
                break;
            case 'profit':
                reportData = await getProfitReportData(params);
                break;
            case 'inventory':
                reportData = await getInventoryReportData();
                break;
            default:
                throw new Error('Invalid report type');
        }

        const pdfBuffer = await generateReportPDF(type, reportData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

export const exportReportExcel = async (req, res, next) => {
    try {
        const { type, ...params } = req.query;

        let reportData;
        switch (type) {
            case 'sales':
                reportData = await getSalesReportData(params);
                break;
            case 'profit':
                reportData = await getProfitReportData(params);
                break;
            case 'inventory':
                reportData = await getInventoryReportData();
                break;
            default:
                throw new Error('Invalid report type');
        }

        const excelBuffer = await generateReportExcel(type, reportData);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
        res.send(excelBuffer);
    } catch (error) {
        next(error);
    }
};

// Helper functions to get report data
async function getSalesReportData(params) {
    // Implementation similar to getSalesReport
    return {};
}

async function getProfitReportData(params) {
    // Implementation similar to getProfitReport
    return {};
}

async function getInventoryReportData() {
    // Implementation similar to getInventoryReport
    return {};
}
