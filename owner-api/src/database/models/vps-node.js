import { DataTypes, Model } from 'sequelize';

export class VpsNode extends Model {}

export function initVpsNodeModel(sequelize) {
    VpsNode.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true
            },
            region: {
                type: DataTypes.STRING(60),
                allowNull: false
            },
            ipAddress: {
                type: DataTypes.STRING(60),
                allowNull: false,
                field: 'ip_address'
            },
            capacity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            health: {
                type: DataTypes.STRING(40),
                allowNull: false,
                defaultValue: 'unknown'
            }
        },
        {
            sequelize,
            modelName: 'VpsNode',
            tableName: 'vps_nodes'
        }
    );

    return VpsNode;
}
