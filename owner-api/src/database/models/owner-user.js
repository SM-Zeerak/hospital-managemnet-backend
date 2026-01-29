import { DataTypes, Model } from 'sequelize';

export class OwnerUser extends Model {}

export function initOwnerUserModel(sequelize) {
    OwnerUser.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            email: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            passwordHash: {
                type: DataTypes.STRING(200),
                allowNull: false,
                field: 'password_hash'
            },
            role: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'super-admin'
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            },
            lastLoginAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'last_login_at'
            }
        },
        {
            sequelize,
            modelName: 'OwnerUser',
            tableName: 'owner_users'
        }
    );

    return OwnerUser;
}
