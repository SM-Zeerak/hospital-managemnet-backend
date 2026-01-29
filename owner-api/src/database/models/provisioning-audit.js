import { DataTypes, Model } from 'sequelize';

export class ProvisioningAudit extends Model {}

export function initProvisioningAuditModel(sequelize) {
    ProvisioningAudit.init(
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
            step: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            status: {
                type: DataTypes.STRING(40),
                allowNull: false,
                defaultValue: 'pending'
            },
            payload: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            error: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'ProvisioningAudit',
            tableName: 'provisioning_audit'
        }
    );

    return ProvisioningAudit;
}
