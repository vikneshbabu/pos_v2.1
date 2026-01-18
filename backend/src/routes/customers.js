import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    getCustomerOrders,
    updateLoyaltyPoints
} from '../controllers/customerController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.get('/:id/orders', getCustomerOrders);

router.post('/', [
    body('name').notEmpty().withMessage('Customer name is required')
], createCustomer);

router.put('/:id', updateCustomer);
router.post('/:id/loyalty', updateLoyaltyPoints);

export default router;
