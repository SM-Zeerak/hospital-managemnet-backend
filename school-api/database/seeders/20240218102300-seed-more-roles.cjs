'use strict';

const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // Extra Departments
        const departmentDefs = [
            { name: 'Library', description: 'School library and resource center' },
            { name: 'Canteen', description: 'School cafeteria and food services' },
            { name: 'Security', description: 'School safety and security services' },
            { name: 'IT', description: 'Information technology support' },
            { name: 'Finance', description: 'School fees and accounts' }
        ];

        // Check for existing departments
        const existingDeptNames = await queryInterface.sequelize.query(
            `SELECT name FROM departments WHERE name IN (:names)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { names: departmentDefs.map(d => d.name) }
            }
        );
        const existingDeptNameSet = new Set(existingDeptNames.map(d => d.name));

        const departmentsToInsert = departmentDefs
            .filter(dep => !existingDeptNameSet.has(dep.name))
            .map((dep) => ({
                id: uuid(),
                name: dep.name,
                description: dep.description,
                created_at: now,
                updated_at: now
            }));

        if (departmentsToInsert.length > 0) {
            await queryInterface.bulkInsert('departments', departmentsToInsert);
        }

        // Get all departments for lookup
        const allDepartments = await queryInterface.sequelize.query(
            `SELECT id, name FROM departments`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        const departmentIdByName = allDepartments.reduce((acc, dept) => {
            acc[dept.name] = dept.id;
            return acc;
        }, {});

        // Extra Roles
        const roleDefs = [
            { name: 'IT head', description: 'Head of IT Department', department: 'IT' },
            { name: 'It staff', description: 'IT Support Staff', department: 'IT' },
            { name: 'Finance Head', description: 'Head of Finance Department', department: 'Finance' },
            { name: 'Finance staff', description: 'Finance Department Staff', department: 'Finance' },
            { name: 'Library Staff', description: 'Library Staff', department: 'Library' },
            { name: 'Canteen head', description: 'Head of Canteen', department: 'Canteen' },
            { name: 'Canteen staff', description: 'Canteen Staff', department: 'Canteen' },
            { name: 'Security head', description: 'Head of Security', department: 'Security' },
            { name: 'security staff', description: 'Security Staff', department: 'Security' }
        ];

        // Check for existing roles
        const existingRoleNames = await queryInterface.sequelize.query(
            `SELECT name FROM roles WHERE name IN (:names)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { names: roleDefs.map(r => r.name) }
            }
        );
        const existingRoleNameSet = new Set(existingRoleNames.map(r => r.name));

        const rolesToInsert = roleDefs
            .filter(role => !existingRoleNameSet.has(role.name))
            .map((role) => {
                const deptId = role.department ? departmentIdByName[role.department] : null;
                return {
                    id: uuid(),
                    name: role.name,
                    description: role.description,
                    department_id: deptId,
                    created_at: now,
                    updated_at: now
                };
            });

        if (rolesToInsert.length > 0) {
            await queryInterface.bulkInsert('roles', rolesToInsert);
        }

        // Assign basic permissions to these roles (dashboard.view)
        const dashboardPerm = await queryInterface.sequelize.query(
            `SELECT id FROM permissions WHERE key = 'dashboard.view' LIMIT 1`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (dashboardPerm.length > 0) {
            const permId = dashboardPerm[0].id;
            const allRoles = await queryInterface.sequelize.query(
                `SELECT id, name FROM roles WHERE name IN (:names)`,
                {
                    type: queryInterface.sequelize.QueryTypes.SELECT,
                    replacements: { names: roleDefs.map(r => r.name) }
                }
            );

            const rolePermissionMap = [];
            const existingRolePerms = await queryInterface.sequelize.query(
                `SELECT role_id, permission_id FROM role_permission_map WHERE permission_id = :permId`,
                {
                    type: queryInterface.sequelize.QueryTypes.SELECT,
                    replacements: { permId }
                }
            );
            const existingRolePermSet = new Set(existingRolePerms.map(rp => rp.role_id));

            for (const role of allRoles) {
                if (!existingRolePermSet.has(role.id)) {
                    rolePermissionMap.push({
                        id: uuid(),
                        role_id: role.id,
                        permission_id: permId,
                        created_at: now,
                        updated_at: now
                    });
                }
            }

            if (rolePermissionMap.length > 0) {
                await queryInterface.bulkInsert('role_permission_map', rolePermissionMap);
            }
        }
    },

    async down(queryInterface) {
        const roleNames = [
            'IT head', 'It staff', 'Finance Head', 'Finance staff',
            'Library Staff', 'Canteen head', 'Canteen staff',
            'Security head', 'security staff'
        ];
        const deptNames = ['Library', 'Canteen', 'Security'];

        // Get role IDs to delete from map
        const roles = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name IN (:names)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { names: roleNames }
            }
        );
        const roleIds = roles.map(r => r.id);

        if (roleIds.length > 0) {
            await queryInterface.bulkDelete('role_permission_map', { role_id: roleIds });
            await queryInterface.bulkDelete('user_role_map', { role_id: roleIds });
            await queryInterface.bulkDelete('roles', { id: roleIds });
        }

        await queryInterface.bulkDelete('departments', { name: deptNames });
    }
};
