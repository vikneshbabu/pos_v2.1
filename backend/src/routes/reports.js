import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/rbac.js';
import {
    getSalesReport,
    getProfitReport,
    getTaxReport,
    getInventoryReport,
    getCashDrawerReport,
    exportReportPDF,
    exportReportExcel
} from '../controllers/reportController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

router.get('/sales', getSalesReport);
router.get('/profit', getProfitReport);
router.get('/tax', getTaxReport);
router.get('/inventory', getInventoryReport);
router.get('/cash-drawer', getCashDrawerReport);

router.get('/export/pdf', exportReportPDF);
router.get('/export/excel', exportReportExcel);

export default router;
