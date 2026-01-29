import { DataTypes, Model } from 'sequelize';

export class Feature extends Model {}

export function initFeatureModel(sequelize) {
    Feature.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            key: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            defaultEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'default_enabled'
            }
        },
        {
            sequelize,
            modelName: 'Feature',
            tableName: 'features'
        }
    );

    return Feature;
}
