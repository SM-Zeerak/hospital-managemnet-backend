import {
    createListRoomsController,
    createCreateRoomController,
    createGetRoomController,
    createUpdateRoomController,
    createDeleteRoomController
} from './controller.js';

export function registerRoomRoutes(app) {
    const listController = createListRoomsController(app);
    const createController = createCreateRoomController(app);
    const getController = createGetRoomController(app);
    const updateController = createUpdateRoomController(app);
    const deleteController = createDeleteRoomController(app);

    const authGuard = app.authGuard;
    const requireAdmin = app.roleGuard(['admin', 'sub-admin']);
    const requireRead = app.permissionGuard('rooms.read');
    const requireCreate = app.permissionGuard('rooms.create');
    const requireUpdate = app.permissionGuard('rooms.update');
    const requireDelete = app.permissionGuard('rooms.delete');

    app.get('/tenant/rooms', {
        schema: {
            tags: ['Rooms'],
            summary: 'List rooms',
            description: 'Get a list of all hospital rooms',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, requireRead]
    }, listController);

    app.post('/tenant/rooms', {
        schema: {
            tags: ['Rooms'],
            summary: 'Create room',
            description: 'Create a new hospital room',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    bedIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' }
                    }
                }
            }
        },
        preHandler: [authGuard, requireCreate]
    }, createController);

    app.get('/tenant/rooms/:id', {
        schema: {
            tags: ['Rooms'],
            summary: 'Get room by ID',
            description: 'Get details of a specific room',
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

    app.patch('/tenant/rooms/:id', {
        schema: {
            tags: ['Rooms'],
            summary: 'Update room',
            description: 'Update room information',
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
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    bedIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' }
                    }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, updateController);

    app.delete('/tenant/rooms/:id', {
        schema: {
            tags: ['Rooms'],
            summary: 'Delete room',
            description: 'Delete a room from the system',
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
