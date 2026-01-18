import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/rbac.js';
import {
    adjustStock,
    getStockHistory,
    createPurchase,
    getAllPurchases,
    receivePurchase
} from '../controllers/inventoryController.js';

const router = express.Router();

router.use(authenticate);

// Stock adjustments
router.post('/adjust', authorize(ROLES.ADMIN, ROLES.MANAGER), [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('adjustmentType').isIn(['add', 'remove', 'set']).withMessage('Invalid adjustment type'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
    body('reason').notEmpty().withMessage('Reason is required')
], adjustStock);

router.get('/history/:productId', getStockHistory);

// Purchases
router.post('/purchase', authorize(ROLES.ADMIN, ROLES.MANAGER), createPurchase);
router.get('/purchases', getAllPurchases);
router.put('/purchases/:id/receive', authorize(ROLES.ADMIN, ROLES.MANAGER), receivePurchase);

export default router;
