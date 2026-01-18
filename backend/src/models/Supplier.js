import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    contactPerson: {
        type: DataTypes.STRING(100)
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
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'suppliers'
});

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    purchaseNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'id'
        }
    },
    items: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    purchaseDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    receivedDate: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('pending', 'received', 'cancelled'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'purchases',
    hooks: {
        beforeCreate: async (purchase) => {
            if (!purchase.purchaseNumber) {
                const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                purchase.purchaseNumber = `PUR-${date}-${random}`;
            }
        }
    }
});

export { Supplier, Purchase };
