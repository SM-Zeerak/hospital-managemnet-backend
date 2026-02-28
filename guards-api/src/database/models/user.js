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
            },
            staffCode: {
                type: DataTypes.STRING(80),
                allowNull: true,
                field: 'staff_code'
            },
            personalInfo: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: {},
                field: 'personal_info'
            },
            qualificationInfo: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
                field: 'qualification_info'
            },
            experienceInfo: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
                field: 'experience_info'
            },
            salary: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true
            },
            imageUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'image_url'
            },
            cloudinaryPublicId: {
                type: DataTypes.STRING(120),
                allowNull: true,
                field: 'cloudinary_public_id'
            },
            cloudinaryResourceType: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'cloudinary_resource_type'
            },
            rfidCardNumber: {
                type: DataTypes.STRING(80),
                allowNull: true,
                field: 'rfid_card_number'
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
