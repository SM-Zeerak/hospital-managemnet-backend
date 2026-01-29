import { DataTypes, Model } from 'sequelize';

const TENANT_ID = process.env.TENANT_ID || null;

export class TenantUser extends Model {}

export function initTenantUserModel(sequelize) {
    TenantUser.init(
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
            tenantId: {
                type: DataTypes.UUID,
                allowNull: !TENANT_ID,
                defaultValue: TENANT_ID,
                field: 'tenant_id'
            },
            firstName: {
                type: DataTypes.STRING(80),
                allowNull: false,
                field: 'first_name'
            },
            lastName: {
                type: DataTypes.STRING(80),
                allowNull: false,
                field: 'last_name'
            },
            departmentId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'department_id'
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'active'
            },
            lastLoginAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'last_login_at'
            }
        },
        {
            sequelize,
            modelName: 'TenantUser',
            tableName: 'users'
        }
    );

    return TenantUser;
}
