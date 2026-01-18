import { AppError } from './errorHandler.js';

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        next();
    };
};

// Role hierarchy: admin > manager > cashier
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CASHIER: 'cashier'
};

export const PERMISSIONS = {
    // User management
    MANAGE_USERS: [ROLES.ADMIN],
    VIEW_USERS: [ROLES.ADMIN, ROLES.MANAGER],

    // Product management
    MANAGE_PRODUCTS: [ROLES.ADMIN, ROLES.MANAGER],
    VIEW_PRODUCTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],

    // Inventory management
    MANAGE_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER],
    VIEW_INVENTORY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],

    // Sales
    CREATE_ORDERS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
    VIEW_ORDERS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
    REFUND_ORDERS: [ROLES.ADMIN, ROLES.MANAGER],

    // Customers
    MANAGE_CUSTOMERS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],

    // Reports
    VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],
    EXPORT_REPORTS: [ROLES.ADMIN, ROLES.MANAGER]
};
