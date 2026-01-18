import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    customerId: {
        type: DataTypes.UUID,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    items: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('cash', 'card', 'upi', 'wallet'),
        allowNull: false
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'refunded'),
        defaultValue: 'completed'
    },
    cashierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('completed', 'cancelled', 'refunded'),
        defaultValue: 'completed'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'orders',
    hooks: {
        beforeCreate: async (order) => {
            if (!order.orderNumber) {
                // Generate order number: ORD-YYYYMMDD-XXXX
                const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                order.orderNumber = `ORD-${date}-${random}`;
            }
        }
    }
});

export default Order;
