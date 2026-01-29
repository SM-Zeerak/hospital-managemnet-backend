import { DataTypes, Model } from 'sequelize';

export class Plan extends Model {}

export function initPlanModel(sequelize) {
    Plan.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(80),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            limits: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            }
        },
        {
            sequelize,
            modelName: 'Plan',
            tableName: 'plans'
        }
    );

    return Plan;
}
