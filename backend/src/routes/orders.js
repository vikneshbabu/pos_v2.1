import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/rbac.js';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    refundOrder,
    getReceipt
} from '../controllers/orderController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('paymentMethod').isIn(['cash', 'card', 'upi', 'wallet']).withMessage('Invalid payment method'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive')
], createOrder);

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/:id/refund', authorize(ROLES.ADMIN, ROLES.MANAGER), refundOrder);
router.get('/:id/receipt', getReceipt);

export default router;
