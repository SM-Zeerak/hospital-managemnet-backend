import { DataTypes, Model } from 'sequelize';

const TENANT_ID = process.env.TENANT_ID || null;

export class Guard extends Model {}

export function initGuardModel(sequelize) {
    Guard.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            tenantId: {
                type: DataTypes.UUID,
                allowNull: !TENANT_ID,
                defaultValue: TENANT_ID,
                field: 'tenant_id'
            },
            guardId: {
                type: DataTypes.STRING(80),
                allowNull: true,
                field: 'guard_id'
            },
            dateOfRegistration: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'date_of_registration'
            },
            name: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            fatherName: {
                type: DataTypes.STRING(120),
                allowNull: true,
                field: 'father_name'
            },
            dateOfBirth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'date_of_birth'
            },
            education: {
                type: DataTypes.STRING(120),
                allowNull: true
            },
            cnic: {
                type: DataTypes.STRING(24),
                allowNull: true
            },
            currentAddress: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'current_address'
            },
            permanentAddress: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'permanent_address'
            },
            contactNo1: {
                type: DataTypes.STRING(24),
                allowNull: true,
                field: 'contact_no1'
            },
            contactNo2: {
                type: DataTypes.STRING(24),
                allowNull: true,
                field: 'contact_no2'
            },
            salary: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true
            },
            policeDistrictCurrent: {
                type: DataTypes.STRING(120),
                allowNull: true,
                field: 'police_district_current'
            },
            policeDistrictPermanent: {
                type: DataTypes.STRING(120),
                allowNull: true,
                field: 'police_district_permanent'
            },
            sameAddress: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'same_address'
            },
            language: {
                type: DataTypes.STRING(60),
                allowNull: true
            },
            married: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            emergencyContact: {
                type: DataTypes.JSONB,
                allowNull: true,
                field: 'emergency_contact'
            },
            services: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            questions: {
                type: DataTypes.JSONB,
                allowNull: true
            },
            references: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: []
            },
            imageUrl: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'image_url'
            },
            imageCloudinaryPublicId: {
                type: DataTypes.STRING(120),
                allowNull: true,
                field: 'image_cloudinary_public_id'
            },
            imageCloudinaryResourceType: {
                type: DataTypes.STRING(20),
                allowNull: true,
                field: 'image_cloudinary_resource_type'
            },
            documents: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: []
            }
        },
        {
            sequelize,
            modelName: 'Guard',
            tableName: 'guards',
            underscored: true
        }
    );

    return Guard;
}
