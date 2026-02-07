import {
    createListBedsController,
    createCreateBedController,
    createGetBedController,
    createUpdateBedController,
    createDeleteBedController
} from './controller.js';

export function registerBedRoutes(app) {
    const listController = createListBedsController(app);
    const createController = createCreateBedController(app);
    const getController = createGetBedController(app);
    const updateController = createUpdateBedController(app);
    const deleteController = createDeleteBedController(app);

    const authGuard = app.authGuard;
    const requireAdmin = app.roleGuard(['admin', 'sub-admin']);
    const requireRead = app.permissionGuard('beds.read');
    const requireCreate = app.permissionGuard('beds.create');
    const requireUpdate = app.permissionGuard('beds.update');
    const requireDelete = app.permissionGuard('beds.delete');

    app.get('/tenant/beds', {
        schema: {
            tags: ['Beds'],
            summary: 'List beds',
            description: 'Get a list of all hospital beds',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    roomId: { type: 'string', format: 'uuid' },
                    status: { type: 'string', enum: ['active', 'maintenance', 'inactive'] },
                    available: { type: 'string', description: 'Filter active beds (true/false)' },
                    quality: { type: 'string' }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, listController);

    app.post('/tenant/beds', {
        schema: {
            tags: ['Beds'],
            summary: 'Create bed',
            description: 'Create a new hospital bed',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    quality: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'maintenance', 'inactive'] },
                    rate: { type: 'number' },
                    roomId: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireCreate]
    }, createController);

    app.get('/tenant/beds/:id', {
        schema: {
            tags: ['Beds'],
            summary: 'Get bed by ID',
            description: 'Get details of a specific bed',
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

    app.patch('/tenant/beds/:id', {
        schema: {
            tags: ['Beds'],
            summary: 'Update bed',
            description: 'Update bed information',
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
                    quality: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'maintenance', 'inactive'] },
                    rate: { type: 'number' },
                    roomId: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, updateController);

    app.delete('/tenant/beds/:id', {
        schema: {
            tags: ['Beds'],
            summary: 'Delete bed',
            description: 'Delete a bed from the system',
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
