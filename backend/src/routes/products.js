import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/rbac.js';
import {
    getAllProducts,
    getProductById,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts
} from '../controllers/productController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProductById);

router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), [
    body('sku').notEmpty().withMessage('SKU is required'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], createProduct);

router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), updateProduct);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), deleteProduct);

export default router;
