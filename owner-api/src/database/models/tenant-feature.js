import { DataTypes, Model } from 'sequelize';

export class TenantFeature extends Model {}

export function initTenantFeatureModel(sequelize) {
    TenantFeature.init(
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
            featureId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'feature_id'
            },
            enabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            valueJson: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'value_json'
            }
        },
        {
            sequelize,
            modelName: 'TenantFeature',
            tableName: 'tenant_features'
        }
    );

    return TenantFeature;
}
