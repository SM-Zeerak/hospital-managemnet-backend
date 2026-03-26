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
