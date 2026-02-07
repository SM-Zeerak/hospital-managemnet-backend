import { DataTypes, Model } from 'sequelize';

const TENANT_ID = process.env.TENANT_ID || null;

export class Driver extends Model { }

export function initDriverModel(sequelize) {
    Driver.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            uid: {
                type: DataTypes.STRING(128),
                allowNull: false,
                unique: true,
                field: 'uid'
            },
            driverId: {
                type: DataTypes.STRING(50),
                allowNull: false,
                field: 'driver_id'
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            salary: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'Active'
            },
            email: {
                type: DataTypes.STRING(120),
                allowNull: false,
                validate: {
                    isEmail: true
                }
            },
            aqama: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            mobile: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
            registrationDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'registration_date'
            },
            iqamaExpiry: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'iqama_expiry'
            },
            experience: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            imageUrl: {
                type: DataTypes.STRING(500),
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
            modelName: 'Driver',
            tableName: 'drivers'
        }
    );

    return Driver;
}
