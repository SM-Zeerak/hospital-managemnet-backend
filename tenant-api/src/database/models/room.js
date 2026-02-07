import { DataTypes, Model } from 'sequelize';

export class Room extends Model { }

export function initRoomModel(sequelize) {
    Room.init(
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
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'active'
            }
        },
        {
            sequelize,
            modelName: 'Room',
            tableName: 'rooms'
        }
    );

    return Room;
}
