import {
    createListPermissionsController,
    createCreatePermissionController,
    createGetPermissionController,
    createUpdatePermissionController,
    createDeletePermissionController
} from './controller.js';

export function registerPermissionRoutes(app) {
    const listController = createListPermissionsController(app);
    const createController = createCreatePermissionController(app);
    const getController = createGetPermissionController(app);
    const updateController = createUpdatePermissionController(app);
    const deleteController = createDeletePermissionController(app);

    const authGuard = app.authGuard;
    const requireAdmin = app.roleGuard(['admin', 'sub-admin']);
    const requireRead = app.permissionGuard('permissions.read');
    const requireCreate = app.permissionGuard('permissions.create');
    const requireUpdate = app.permissionGuard('permissions.update');
    const requireDelete = app.permissionGuard('permissions.delete');

    app.get('/school/permissions', {
        schema: {
            tags: ['Permissions'],
            summary: 'List permissions',
            description: 'Get a list of all available permissions',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, requireRead]
    }, listController);

    app.post('/school/permissions', {
        schema: {
            tags: ['Permissions'],
            summary: 'Create permission',
            description: 'Create a new permission',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['key', 'name'],
                properties: {
                    key: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' }
                }
            }
        },
        preHandler: [authGuard, requireAdmin, requireCreate]
    }, createController);

    app.get('/school/permissions/:id', {
        schema: {
            tags: ['Permissions'],
            summary: 'Get permission by ID',
            description: 'Get details of a specific permission',
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

    app.patch('/school/permissions/:id', {
        schema: {
            tags: ['Permissions'],
            summary: 'Update permission',
            description: 'Update permission information',
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
                    description: { type: 'string' }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, updateController);

    app.delete('/school/permissions/:id', {
        schema: {
            tags: ['Permissions'],
            summary: 'Delete permission',
            description: 'Delete a permission from the system',
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
