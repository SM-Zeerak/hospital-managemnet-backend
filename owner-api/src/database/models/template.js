import { DataTypes, Model } from 'sequelize';

export class Template extends Model {}

export function initTemplateModel(sequelize) {
    Template.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            key: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },
            type: {
                type: DataTypes.STRING(60),
                allowNull: false,
                defaultValue: 'email'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            metadata: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            version: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            }
        },
        {
            sequelize,
            modelName: 'Template',
            tableName: 'templates'
        }
    );

    return Template;
}
