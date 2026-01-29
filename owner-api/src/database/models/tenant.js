import { DataTypes, Model } from 'sequelize';

export class Tenant extends Model {}

export function initTenantModel(sequelize) {
    Tenant.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            companyName: {
                type: DataTypes.STRING(150),
                allowNull: false,
                field: 'company_name'
            },
            subdomain: {
                type: DataTypes.STRING(80),
                allowNull: false,
                unique: true
            },
            tenantDbName: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true,
                field: 'tenant_db_name'
            },
            tenantRegion: {
                type: DataTypes.STRING(60),
                allowNull: true,
                field: 'tenant_region'
            },
            status: {
                type: DataTypes.STRING(40),
                allowNull: false,
                defaultValue: 'provisioning'
            },
            planId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'plan_id'
            },
            vpsNodeId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'vps_node_id'
            },
            syncWebhookUrl: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'sync_webhook_url'
            }
        },
        {
            sequelize,
            modelName: 'Tenant',
            tableName: 'tenants'
        }
    );

    return Tenant;
}
