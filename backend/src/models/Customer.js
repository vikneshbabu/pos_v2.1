import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customerId: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    address: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    loyaltyPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    creditBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    totalPurchases: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    lastPurchaseDate: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'customers',
    hooks: {
        beforeCreate: async (customer) => {
            if (!customer.customerId) {
                // Generate customer ID: CUST-YYYYMMDD-XXXX
                const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                customer.customerId = `CUST-${date}-${random}`;
            }
        }
    }
});

export default Customer;
