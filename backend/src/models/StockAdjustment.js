import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const StockAdjustment = sequelize.define('StockAdjustment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    adjustmentType: {
        type: DataTypes.ENUM('add', 'remove', 'set'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    previousQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    newQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    performedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'stock_adjustments',
    updatedAt: false
});

export default StockAdjustment;
