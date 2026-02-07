import { DataTypes, Model } from 'sequelize';

export class Bed extends Model { }

export function initBedModel(sequelize) {
    Bed.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            quality: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'active'
            },
            rate: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            roomId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'room_id'
            }
        },
        {
            sequelize,
            modelName: 'Bed',
            tableName: 'beds'
        }
    );

    return Bed;
}
