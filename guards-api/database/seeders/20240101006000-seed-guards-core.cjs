'use strict';

const { hashSync } = require('bcrypt');
const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // Guard Departments
        const departmentDefs = [
            { name: 'Command Center', description: 'Central command and monitoring' },
            { name: 'Patrol', description: 'Field patrol units' },
            { name: 'HR', description: 'Human resources and recruitment' },
            { name: 'Equipment', description: 'Equipment and armory management' },
            { name: 'Training', description: 'Training and compliance' }
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

        // Get all departments
        const allDepartments = await queryInterface.sequelize.query(
            `SELECT id, name FROM departments WHERE name IN (:names)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { names: departmentDefs.map(d => d.name) }
            }
        );
        const departmentIdByName = allDepartments.reduce((acc, dept) => {
            acc[dept.name] = dept.id;
            return acc;
        }, {});

        // Guard Permissions
        const permissionDefs = [
            ['dashboard.view', 'View dashboard'],
            ['users.read', 'View users'],
            ['users.create', 'Create users'],
            ['users.update', 'Update users'],
            ['departments.read', 'View departments'],
            ['roles.read', 'View roles'],
            ['permissions.read', 'View permissions'],
            ['staff.read', 'View staff'],
            ['staff.update', 'Update staff status'],
            ['patrols.read', 'View patrol logs'],
            ['patrols.create', 'Create patrol logs'],
            ['incidents.read', 'View incidents'],
            ['incidents.create', 'Report incidents'],
            ['guards.read', 'View guards'],
            ['guards.create', 'Create guards'],
            ['guards.update', 'Update guards'],
            ['guards.delete', 'Delete guards']
        ];

        // insert permissions logic similar to above...
        const existingPermKeys = await queryInterface.sequelize.query(
            `SELECT key FROM permissions WHERE key IN (:keys)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { keys: permissionDefs.map(p => p[0]) }
            }
        );
        const existingPermKeySet = new Set(existingPermKeys.map(p => p.key));

        const permissionsToInsert = permissionDefs
            .filter(([key]) => !existingPermKeySet.has(key))
            .map(([key, name]) => ({
                id: uuid(),
                key,
                name,
                description: null,
                created_at: now,
                updated_at: now
            }));

        if (permissionsToInsert.length > 0) {
            await queryInterface.bulkInsert('permissions', permissionsToInsert);
        }

        const allPermissions = await queryInterface.sequelize.query(
            `SELECT id, key FROM permissions WHERE key IN (:keys)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { keys: permissionDefs.map(p => p[0]) }
            }
        );
        const permissionIdByKey = allPermissions.reduce((acc, perm) => {
            acc[perm.key] = perm.id;
            return acc;
        }, {});
        const allPermissionKeys = allPermissions.map(p => p.key);

        // Guard Roles (admin and cso get all permissions including guards.read/create/update/delete)
        const guardsPermissionKeys = ['guards.read', 'guards.create', 'guards.update', 'guards.delete'];
        const roleDefs = [
            {
                name: 'admin',
                description: 'System Administrator',
                department: 'Command Center',
                permissions: allPermissionKeys
            },
            {
                name: 'cso',
                description: 'Chief Security Officer',
                department: 'Command Center',
                permissions: allPermissionKeys
            },
            {
                name: 'supervisor',
                description: 'Shift Supervisor',
                department: 'Patrol',
                permissions: ['dashboard.view', 'staff.read', 'patrols.read', 'incidents.create', 'incidents.read']
            },
            {
                name: 'guard',
                description: 'Security Guard',
                department: 'Patrol',
                permissions: ['dashboard.view', 'patrols.create', 'incidents.create']
            }
        ];

        // Check/Insert Roles...
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

        const allRoles = await queryInterface.sequelize.query(
            `SELECT id, name FROM roles WHERE name IN (:names)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { names: roleDefs.map(r => r.name) }
            }
        );
        const roleIdByName = allRoles.reduce((acc, role) => {
            acc[role.name] = role.id;
            return acc;
        }, {});

        // Role-Permissions Map
        const rolePermissionMap = [];
        const existingRolePerms = await queryInterface.sequelize.query(
            `SELECT role_id, permission_id FROM role_permission_map`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        const existingRolePermSet = new Set(existingRolePerms.map(rp => `${rp.role_id}:${rp.permission_id}`));

        for (const role of roleDefs) {
            const roleId = roleIdByName[role.name];
            if (!roleId) continue;

            for (const key of role.permissions) {
                const permId = permissionIdByKey[key];
                if (permId) {
                    const uniqueKey = `${roleId}:${permId}`;
                    if (!existingRolePermSet.has(uniqueKey)) {
                        rolePermissionMap.push({
                            id: uuid(),
                            role_id: roleId,
                            permission_id: permId,
                            created_at: now,
                            updated_at: now
                        });
                        existingRolePermSet.add(uniqueKey);
                    }
                }
            }
        }

        if (rolePermissionMap.length > 0) {
            await queryInterface.bulkInsert('role_permission_map', rolePermissionMap);
        }

        // Ensure admin role has guards permissions (for existing admins created before guards module was added)
        const adminRoleIdForGuards = roleIdByName['admin'];
        if (adminRoleIdForGuards) {
            for (const key of guardsPermissionKeys) {
                const permId = permissionIdByKey[key];
                if (permId) {
                    const uniqueKey = `${adminRoleIdForGuards}:${permId}`;
                    if (!existingRolePermSet.has(uniqueKey)) {
                        await queryInterface.bulkInsert('role_permission_map', [{
                            id: uuid(),
                            role_id: adminRoleIdForGuards,
                            permission_id: permId,
                            created_at: now,
                            updated_at: now
                        }]);
                        existingRolePermSet.add(uniqueKey);
                    }
                }
            }
        }

        // Default Admin
        const adminDept = allDepartments.find(d => d.name === 'Command Center');
        const adminRoleId = roleIdByName['admin'];
        const email = 'admin@guards.com';

        const existingUsers = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE email = :email`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { email }
            }
        );

        let userId;
        if (existingUsers.length === 0) {
            const newUser = {
                id: uuid(),
                email,
                password_hash: hashSync('Admin@123', 10),
                first_name: 'Guards',
                last_name: 'Admin',
                department_id: adminDept?.id || null,
                status: 'active',
                created_at: now,
                updated_at: now
            };
            await queryInterface.bulkInsert('users', [newUser]);
            userId = newUser.id;
        } else {
            userId = existingUsers[0].id;
        }

        if (adminRoleId && userId) {
            const existingUserRole = await queryInterface.sequelize.query(
                `SELECT id FROM user_role_map WHERE user_id = :userId AND role_id = :roleId`,
                {
                    type: queryInterface.sequelize.QueryTypes.SELECT,
                    replacements: { userId, roleId: adminRoleId }
                }
            );
            if (existingUserRole.length === 0) {
                await queryInterface.bulkInsert('user_role_map', [{
                    id: uuid(),
                    user_id: userId,
                    role_id: adminRoleId,
                    created_at: now,
                    updated_at: now
                }]);
            }
        }
    },

    async down(queryInterface) {
        // ... cleanup
        await queryInterface.bulkDelete('user_role_map', null, {});
        await queryInterface.bulkDelete('users', { email: 'admin@guards.com' }, {});
        await queryInterface.bulkDelete('role_permission_map', null, {});
        await queryInterface.bulkDelete('roles', null, {});
        await queryInterface.bulkDelete('permissions', null, {});
        await queryInterface.bulkDelete('departments', null, {});
    }
};
