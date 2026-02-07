import {
    createListRolesController,
    createCreateRoleController,
    createGetRoleController,
    createUpdateRoleController,
    createDeleteRoleController
} from './controller.js';

export function registerRoleRoutes(app) {
    const listController = createListRolesController(app);
    const createController = createCreateRoleController(app);
    const getController = createGetRoleController(app);
    const updateController = createUpdateRoleController(app);
    const deleteController = createDeleteRoleController(app);

    const authGuard = app.authGuard;
    const requireAdmin = app.roleGuard(['admin', 'sub-admin']);
    const requireRead = app.permissionGuard('roles.read');
    const requireCreate = app.permissionGuard('roles.create');
    const requireUpdate = app.permissionGuard('roles.update');
    const requireDelete = app.permissionGuard('roles.delete');

    app.get('/tour/roles', {
        schema: {
            tags: ['Roles'],
            summary: 'List roles',
            description: 'Get a list of all hospital roles',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    departmentId: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, listController);

    app.post('/tour/roles', {
        schema: {
            tags: ['Roles'],
            summary: 'Create role',
            description: 'Create a new hospital role',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    departmentId: { type: 'string', format: 'uuid' },
                    permissionIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
                }
            }
        },
        preHandler: [authGuard, requireAdmin, requireCreate]
    }, createController);

    app.get('/tour/roles/:id', {
        schema: {
            tags: ['Roles'],
            summary: 'Get role by ID',
            description: 'Get details of a specific role',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, getController);

    app.patch('/tour/roles/:id', {
        schema: {
            tags: ['Roles'],
            summary: 'Update role',
            description: 'Update role information and permissions',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    departmentId: { type: 'string', format: 'uuid' },
                    permissionIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, updateController);

    app.delete('/tour/roles/:id', {
        schema: {
            tags: ['Roles'],
            summary: 'Delete role',
            description: 'Delete a role from the system',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdmin, requireDelete]
    }, deleteController);
}
