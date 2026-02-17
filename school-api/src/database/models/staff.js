import { DataTypes, Model } from 'sequelize';

const TENANT_ID = process.env.TENANT_ID || null;

export class Staff extends Model { }

export function initStaffModel(sequelize) {
    Staff.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'user_id'
            },
            departmentId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'department_id'
            },
            roleId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'role_id'
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
                type: DataTypes.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0
            },
            rfidCardNumber: {
                type: DataTypes.STRING(50),
                allowNull: true,
                unique: true,
                field: 'rfid_card_number'
            },
            imageUrl: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'image_url'
            },
            tenantId: {
                type: DataTypes.UUID,
                allowNull: !TENANT_ID,
                defaultValue: TENANT_ID,
                field: 'tenant_id'
            }
        },
        {
            sequelize,
            modelName: 'Staff',
            tableName: 'staff'
        }
    );

    return Staff;
}
