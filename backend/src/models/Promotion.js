import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Promotion = sequelize.define('Promotion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    type: {
        type: DataTypes.ENUM('percentage', 'fixed', 'buy_x_get_y'),
        allowNull: false
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    applicableProducts: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    minPurchaseAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'promotions'
});

// Check if promotion is currently valid
Promotion.prototype.isValid = function () {
    const now = new Date();
    return this.isActive &&
        now >= this.startDate &&
        now <= this.endDate;
};

export default Promotion;
