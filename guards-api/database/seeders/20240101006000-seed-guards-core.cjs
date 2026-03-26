'use strict';

const { hashSync } = require('bcrypt');
const { v4: uuid } = require('uuid');
const readline = require('node:readline');
const { stdin, stdout } = require('node:process');

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // Note: departments module was removed from guards-api,
        // so we no longer insert or read from the departments table here.

        // Guard Permissions (module-wise)
        // title, key, description
        const permissionDefs = [
            // Dashboard
            ['Dashboard view', 'dashboard.view', 'View dashboard'],

            // Users
            ['Users create', 'users.create', 'Create users'],
            ['Users view', 'users.view', 'View users list and details'],
            ['Users update', 'users.update', 'Update users'],
            ['Users delete', 'users.delete', 'Delete users'],

            // Roles
            ['Roles create', 'roles.create', 'Create roles'],
            ['Roles view', 'roles.view', 'View roles'],
            ['Roles update', 'roles.update', 'Update roles'],
            ['Roles delete', 'roles.delete', 'Delete roles'],

            // Permissions
            ['Permissions view', 'permissions.view', 'View permissions'],

            // Guards
            ['Guards create', 'guards.create', 'Create guards'],
            ['Guards view', 'guards.view', 'View guards list and details'],
            ['Guards update', 'guards.update', 'Update guards'],
            ['Guards delete', 'guards.delete', 'Delete guards'],
            ['Guard documents manage', 'guards.documents.manage', 'Add / update / delete guard documents'],

            // Uploads (generic file uploads)
            ['Uploads manage', 'uploads.manage', 'Upload and delete files via upload module'],

            // Admin module
            ['Admin view settings', 'admin.view', 'View admin settings'],
            ['Admin update settings', 'admin.update', 'Update admin settings']
        ];

        // insert permissions logic similar to above...
        const existingPermKeys = await queryInterface.sequelize.query(
            `SELECT key FROM permissions WHERE key IN (:keys)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { keys: permissionDefs.map(p => p[1]) }
            }
        );
        const existingPermKeySet = new Set(existingPermKeys.map(p => p.key));

        const permissionsToInsert = permissionDefs
            .filter(([, key]) => !existingPermKeySet.has(key))
            .map(([title, key, description]) => ({
                id: uuid(),
                key,
                name: title,
                description,
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
                replacements: { keys: permissionDefs.map(p => p[1]) }
            }
        );
        const permissionIdByKey = allPermissions.reduce((acc, perm) => {
            acc[perm.key] = perm.id;
            return acc;
        }, {});
        const allPermissionKeys = allPermissions.map(p => p.key);
        const allPermissionIds = allPermissions.map(p => p.id);
        const allPermissionIdsJson = JSON.stringify(allPermissionIds);

        // Guard Roles (admin and cso get all permissions including guards.read/create/update/delete)
        const guardsPermissionKeys = ['guards.read', 'guards.create', 'guards.update', 'guards.delete'];
        const roleDefs = [
            {
                name: 'super-admin',
                description: 'Super Administrator (all permissions)',
                department: 'Command Center',
                permissions: allPermissionKeys
            },
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

        // Default Admin & optional Super Admin
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
                status: 'active',
                role_id: adminRoleId || null,
                permission_ids: null,
                created_at: now,
                updated_at: now
            };
            await queryInterface.bulkInsert('users', [newUser]);
            userId = newUser.id;
        } else {
            userId = existingUsers[0].id;
            // Ensure role_id is set on existing admin user
            if (adminRoleId) {
                await queryInterface.sequelize.query(
                    `UPDATE users SET role_id = :roleId WHERE id = :userId`,
                    {
                        type: queryInterface.sequelize.QueryTypes.UPDATE,
                        replacements: { roleId: adminRoleId, userId }
                    }
                );
            }
        }

        // Optional interactive Super Admin creation / update
        const superAdminRoleId = roleIdByName['super-admin'];
        if (superAdminRoleId) {
            const rl = readline.createInterface({ input: stdin, output: stdout });

            const question = (q) => new Promise((resolve) => rl.question(q, resolve));

            // Ask for CREATE
            const createAnswer = await question(
                'Do you want to CREATE a new Super Admin user for guards-api? (y/N): '
            );

            if (String(createAnswer).trim().toLowerCase() === 'y') {
                const emailInput = await question(
                    'Enter Super Admin email (e.g. support@dynamixzone.com): '
                );
                const passwordInput = await question(
                    'Enter Super Admin password (will be hashed, default "Admin@1234" if empty): '
                );

                const superAdminEmail = emailInput.trim() || 'support@dynamixzone.com';
                const plainPassword = passwordInput.trim() || 'Admin@1234';

                const existingSuperAdmins = await queryInterface.sequelize.query(
                    `SELECT id FROM users WHERE email = :email`,
                    {
                        type: queryInterface.sequelize.QueryTypes.SELECT,
                        replacements: { email: superAdminEmail }
                    }
                );

                let superAdminUserId;
                if (existingSuperAdmins.length === 0) {
                    const newSuperAdmin = {
                        id: uuid(),
                        email: superAdminEmail,
                        password_hash: hashSync(plainPassword, 10),
                        first_name: 'Guards',
                        last_name: 'SuperAdmin',
                        status: 'active',
                        role_id: superAdminRoleId || null,
                        // jsonb column: pass serialized JSON string
                        permission_ids: allPermissionIdsJson,
                        created_at: now,
                        updated_at: now
                    };
                    await queryInterface.bulkInsert('users', [newSuperAdmin]);
                    superAdminUserId = newSuperAdmin.id;
                } else {
                    superAdminUserId = existingSuperAdmins[0].id;
                    // Ensure role_id and full permissions are set on existing super admin
                    await queryInterface.sequelize.query(
                        `UPDATE users SET role_id = :roleId, permission_ids = :permIds::jsonb WHERE id = :userId`,
                        {
                            type: queryInterface.sequelize.QueryTypes.UPDATE,
                            replacements: { roleId: superAdminRoleId, permIds: allPermissionIdsJson, userId: superAdminUserId }
                        }
                    );
                }
            }

            // Ask for UPDATE of all existing Super Admin users
            const updateAnswer = await question(
                'Do you want to UPDATE all existing Super Admin users to have full permissions? (y/N): '
            );

            if (String(updateAnswer).trim().toLowerCase() === 'y') {
                const existingSupers = await queryInterface.sequelize.query(
                    `SELECT id FROM users WHERE role_id = :roleId`,
                    {
                        type: queryInterface.sequelize.QueryTypes.SELECT,
                        replacements: { roleId: superAdminRoleId }
                    }
                );

                for (const row of existingSupers) {
                    await queryInterface.sequelize.query(
                        `UPDATE users SET permission_ids = :permIds::jsonb WHERE id = :userId`,
                        {
                            type: queryInterface.sequelize.QueryTypes.UPDATE,
                            replacements: { permIds: allPermissionIdsJson, userId: row.id }
                        }
                    );
                }
            }

            rl.close();
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
