import { DataTypes, Model } from 'sequelize';

export class TemplateMeta extends Model {}

export function initTemplateMetaModel(sequelize) {
    TemplateMeta.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            globalVersion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                field: 'global_version'
            }
        },
        {
            sequelize,
            modelName: 'TemplateMeta',
            tableName: 'template_meta',
            updatedAt: 'updated_at',
            createdAt: false
        }
    );

    return TemplateMeta;
}
