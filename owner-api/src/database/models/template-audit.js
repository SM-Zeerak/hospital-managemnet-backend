import { DataTypes, Model } from 'sequelize';

export class TemplateAudit extends Model {}

export function initTemplateAuditModel(sequelize) {
    TemplateAudit.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            templateId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'template_id'
            },
            version: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            changeType: {
                type: DataTypes.STRING(80),
                allowNull: false,
                field: 'change_type'
            },
            diff: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            triggeredBy: {
                type: DataTypes.STRING(150),
                allowNull: true,
                field: 'triggered_by'
            }
        },
        {
            sequelize,
            modelName: 'TemplateAudit',
            tableName: 'template_audits'
        }
    );

    return TemplateAudit;
}


