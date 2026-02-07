import { DataTypes, Model } from 'sequelize';

export class Department extends Model {}

export function initDepartmentModel(sequelize) {
    Department.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(80),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'Department',
            tableName: 'departments'
        }
    );

    return Department;
}
