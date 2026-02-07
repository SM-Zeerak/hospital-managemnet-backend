import { DataTypes, Model } from 'sequelize';

export class Permission extends Model {}

export function initPermissionModel(sequelize) {
    Permission.init(
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
            }
        },
        {
            sequelize,
            modelName: 'Permission',
            tableName: 'permissions'
        }
    );

    return Permission;
}
