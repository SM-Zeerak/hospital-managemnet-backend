'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('roles');
        
        if (!tableDescription.department_id) {
            await queryInterface.addColumn('roles', 'department_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'departments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
            
            await queryInterface.addIndex('roles', ['department_id'], {
                name: 'roles_department_id_idx'
            });
        }
        
        const departments = await queryInterface.sequelize.query(
            `SELECT id, name FROM departments`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        const departmentMap = new Map();
        if (Array.isArray(departments)) {
            departments.forEach(dept => {
                departmentMap.set(dept.name, dept.id);
            });
        }
        
        // Hospital role to department mapping
        const roleDepartmentMap = {
            'admin': 'Administration',
            'sub-admin': 'Administration',
            'doctor': 'Medical',
            'nurse': 'Nursing',
            'pharmacist': 'Pharmacy',
            'lab-technician': 'Laboratory',
            'radiologist': 'Radiology',
            'finance-manager': 'Finance',
            'hr-manager': 'Human Resources',
            'it-admin': 'IT'
        };
        
        for (const [roleName, deptName] of Object.entries(roleDepartmentMap)) {
            const deptId = departmentMap.get(deptName);
            if (deptId) {
                await queryInterface.sequelize.query(
                    `UPDATE roles SET department_id = :deptId WHERE name = :roleName`,
                    {
                        replacements: { deptId, roleName },
                        type: queryInterface.sequelize.QueryTypes.UPDATE
                    }
                );
            }
        }
    },

    async down(queryInterface) {
        try {
            await queryInterface.removeIndex('roles', 'roles_department_id_idx');
        } catch (e) {}
        
        const tableDescription = await queryInterface.describeTable('roles');
        if (tableDescription.department_id) {
            await queryInterface.removeColumn('roles', 'department_id');
        }
    }
};

