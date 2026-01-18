import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    resource: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    resourceId: {
        type: DataTypes.STRING(100)
    },
    details: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    ipAddress: {
        type: DataTypes.STRING(45)
    }
}, {
    tableName: 'activity_logs',
    updatedAt: false
});

export default ActivityLog;
