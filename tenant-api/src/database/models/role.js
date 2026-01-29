import { DataTypes, Model } from 'sequelize';

export class Role extends Model {}

export function initRoleModel(sequelize) {
    Role.init(
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
            departmentId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'department_id'
            }
        },
        {
            sequelize,
            modelName: 'Role',
            tableName: 'roles'
        }
    );

    return Role;
}
