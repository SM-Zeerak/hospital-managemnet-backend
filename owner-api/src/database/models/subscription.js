import { DataTypes, Model } from 'sequelize';

export class Subscription extends Model {}

export function initSubscriptionModel(sequelize) {
    Subscription.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            tenantId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'tenant_id'
            },
            planId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'plan_id'
            },
            status: {
                type: DataTypes.STRING(40),
                allowNull: false,
                defaultValue: 'trial'
            },
            startAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'start_at'
            },
            endAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'end_at'
            },
            nextBillingAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'next_billing_at'
            }
        },
        {
            sequelize,
            modelName: 'Subscription',
            tableName: 'subscriptions'
        }
    );

    return Subscription;
}
