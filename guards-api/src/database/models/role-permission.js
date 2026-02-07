import { DataTypes, Model } from 'sequelize';

export class RolePermission extends Model {}

export function initRolePermissionModel(sequelize) {
    RolePermission.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            roleId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'role_id'
            },
            permissionId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'permission_id'
            }
        },
        {
            sequelize,
            modelName: 'RolePermission',
            tableName: 'role_permission_map'
        }
    );

    return RolePermission;
}
