'use strict';

const { hashSync } = require('bcrypt');
const { v4: uuid } = require('uuid');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // Hospital Departments
        const departmentDefs = [
            { name: 'Administration', description: 'Hospital administration and management' },
            { name: 'Medical', description: 'Medical services and patient care' },
            { name: 'Nursing', description: 'Nursing services and patient care' },
            { name: 'Pharmacy', description: 'Pharmacy and medication management' },
            { name: 'Laboratory', description: 'Laboratory and diagnostic services' },
            { name: 'Radiology', description: 'Radiology and imaging services' },
            { name: 'Emergency', description: 'Emergency department' },
            { name: 'Surgery', description: 'Surgical services' },
            { name: 'Finance', description: 'Finance and billing' },
            { name: 'Human Resources', description: 'Human resources and staff management' },
            { name: 'IT', description: 'Information technology' },
            { name: 'Maintenance', description: 'Facilities and maintenance' }
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

        // Get all departments (existing + newly inserted) for later use
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

        // Hospital Permissions
        const permissionDefs = [
            ['dashboard.view', 'View dashboard'],
            ['users.read', 'View users'],
            ['users.create', 'Create users'],
            ['users.update', 'Update users'],
            ['users.delete', 'Delete users'],
            ['departments.read', 'View departments'],
            ['departments.create', 'Create departments'],
            ['departments.update', 'Update departments'],
            ['departments.delete', 'Delete departments'],
            ['roles.read', 'View roles'],
            ['roles.create', 'Create roles'],
            ['roles.update', 'Update roles'],
            ['roles.delete', 'Delete roles'],
            ['permissions.read', 'View permissions'],
            ['permissions.create', 'Create permissions'],
            ['permissions.update', 'Update permissions'],
            ['permissions.delete', 'Delete permissions'],
            ['staff.read', 'View staff'],
            ['staff.create', 'Create staff'],
            ['staff.update', 'Update staff'],
            ['staff.delete', 'Delete staff'],
            ['beds.read', 'View beds'],
            ['beds.create', 'Create beds'],
            ['beds.update', 'Update beds'],
            ['beds.delete', 'Delete beds'],
            ['rooms.read', 'View rooms'],
            ['rooms.create', 'Create rooms'],
            ['rooms.update', 'Update rooms'],
            ['rooms.delete', 'Delete rooms']
        ];

        // Check for existing permissions
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

        // Get all permissions (existing + newly inserted) for later use
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

        const allPermissionKeys = allPermissions.map((perm) => perm.key);

        // Hospital Roles
        const roleDefs = [
            {
                name: 'admin',
                description: 'Hospital administrator with full access',
                department: 'Administration',
                permissions: allPermissionKeys
            },
            {
                name: 'sub-admin',
                description: 'Deputy administrator',
                department: 'Administration',
                permissions: allPermissionKeys.filter((key) => key !== 'admin.sync')
            },
            {
                name: 'doctor',
                description: 'Medical doctor',
                department: 'Medical',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'departments.read',
                    'roles.read',
                    'permissions.read'
                ]
            },
            {
                name: 'nurse',
                description: 'Nursing staff',
                department: 'Nursing',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'departments.read',
                    'roles.read',
                    'permissions.read',
                    'beds.read',
                    'beds.update',
                    'rooms.read'
                ]
            },
            {
                name: 'pharmacist',
                description: 'Pharmacy staff',
                department: 'Pharmacy',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'departments.read',
                    'roles.read',
                    'permissions.read'
                ]
            },
            {
                name: 'lab-technician',
                description: 'Laboratory technician',
                department: 'Laboratory',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'departments.read',
                    'roles.read',
                    'permissions.read'
                ]
            },
            {
                name: 'radiologist',
                description: 'Radiology staff',
                department: 'Radiology',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'departments.read',
                    'roles.read',
                    'permissions.read'
                ]
            },
            {
                name: 'finance-manager',
                description: 'Finance department manager',
                department: 'Finance',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'departments.read',
                    'roles.read',
                    'permissions.read',
                    'beds.read',
                    'beds.update',
                    'rooms.read'
                ]
            },
            {
                name: 'hr-manager',
                description: 'Human resources manager',
                department: 'Human Resources',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'users.create',
                    'users.update',
                    'departments.read',
                    'roles.read',
                    'permissions.read'
                ]
            },
            {
                name: 'it-admin',
                description: 'IT administrator',
                department: 'IT',
                permissions: [
                    'dashboard.view',
                    'users.read',
                    'users.update',
                    'departments.read',
                    'roles.read',
                    'permissions.read'
                ]
            }
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

        // Update role department associations
        for (const role of roleDefs) {
            if (role.department) {
                const deptId = departmentIdByName[role.department];
                const roleId = roleIdByName[role.name];
                if (deptId && roleId) {
                    await queryInterface.sequelize.query(
                        `UPDATE roles SET department_id = :deptId WHERE id = :roleId AND (department_id IS NULL OR department_id != :deptId)`,
                        {
                            replacements: { deptId, roleId },
                            type: queryInterface.sequelize.QueryTypes.UPDATE
                        }
                    );
                }
            }
        }

        // Check for existing role-permission mappings
        const existingRolePerms = await queryInterface.sequelize.query(
            `SELECT role_id, permission_id FROM role_permission_map 
             WHERE role_id IN (:roleIds) AND permission_id IN (:permissionIds)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: {
                    roleIds: allRoles.map(r => r.id),
                    permissionIds: allPermissions.map(p => p.id)
                }
            }
        );
        const existingRolePermSet = new Set(
            existingRolePerms.map(rp => `${rp.role_id}:${rp.permission_id}`)
        );

        const rolePermissionMap = [];
        for (const role of roleDefs) {
            const roleId = roleIdByName[role.name];
            if (!roleId) continue;

            const permissionIds = new Set(role.permissions.map((key) => permissionIdByKey[key]).filter(Boolean));
            permissionIds.forEach((permissionId) => {
                const key = `${roleId}:${permissionId}`;
                if (!existingRolePermSet.has(key)) {
                    rolePermissionMap.push({
                        id: uuid(),
                        role_id: roleId,
                        permission_id: permissionId,
                        created_at: now,
                        updated_at: now
                    });
                }
            });
        }

        if (rolePermissionMap.length > 0) {
            await queryInterface.bulkInsert('role_permission_map', rolePermissionMap);
        }

        // Create first admin user with all permissions
        const tenantId = process.env.TENANT_ID || uuid();

        // Get admin department
        const adminDept = allDepartments.find((dep) => dep.name === 'Administration');
        if (!adminDept) {
            throw new Error('Administration department not found');
        }

        // Check if admin user already exists
        const existingUsers = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE email = :email`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { email: 'admin@hospital.com' }
            }
        );

        let adminUserId;
        if (existingUsers.length === 0) {
            const users = [{
                id: uuid(),
                email: 'admin@hospital.com',
                password_hash: hashSync('Admin@123', 10),
                first_name: 'Hospital',
                last_name: 'Admin',
                department_id: adminDept.id,
                tenant_id: tenantId,
                status: 'active',
                created_at: now,
                updated_at: now
            }];
            await queryInterface.bulkInsert('users', users);
            adminUserId = users[0].id;
        } else {
            adminUserId = existingUsers[0].id;
        }

        // Check if user-role mapping already exists
        const existingUserRole = await queryInterface.sequelize.query(
            `SELECT id FROM user_role_map WHERE user_id = :userId AND role_id = :roleId`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: {
                    userId: adminUserId,
                    roleId: roleIdByName['admin']
                }
            }
        );

        if (existingUserRole.length === 0 && roleIdByName['admin']) {
            await queryInterface.bulkInsert('user_role_map', [
                {
                    id: uuid(),
                    user_id: adminUserId,
                    role_id: roleIdByName['admin'],
                    created_at: now,
                    updated_at: now
                }
            ]);
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('user_role_map', null, {});
        await queryInterface.bulkDelete('users', { email: 'admin@hospital.com' }, {});
        await queryInterface.bulkDelete('role_permission_map', null, {});
        await queryInterface.bulkDelete('roles', null, {});
        await queryInterface.bulkDelete('permissions', null, {});
        await queryInterface.bulkDelete('departments', null, {});
    }
};
