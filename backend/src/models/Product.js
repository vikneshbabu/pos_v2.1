import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    barcode: {
        type: DataTypes.STRING(100),
        unique: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING(100)
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    minStockLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        validate: {
            min: 0
        }
    },
    unit: {
        type: DataTypes.STRING(20),
        defaultValue: 'pcs'
    },
    imageUrl: {
        type: DataTypes.STRING(500)
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    indexes: [
        { fields: ['barcode'] },
        { fields: ['category'] },
        { fields: ['isActive'] }
    ]
});

// Virtual field for low stock status
Product.prototype.isLowStock = function () {
    return this.stockQuantity <= this.minStockLevel;
};

export default Product;
