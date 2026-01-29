import {
    createListOwnerUsersController,
    createCreateOwnerUserController,
    createGetOwnerUserController,
    createUpdateOwnerUserController,
    createDeleteOwnerUserController
} from './controller.js';

export function registerOwnerUsersRoutes(app) {
    const listController = createListOwnerUsersController(app);
    const createController = createCreateOwnerUserController(app);
    const getController = createGetOwnerUserController(app);
    const updateController = createUpdateOwnerUserController(app);
    const deleteController = createDeleteOwnerUserController(app);

    const authGuard = app.authGuard;
    const allowSuperAdmin = app.roleGuard(['super-admin']);

    app.get('/owner/users', {
        schema: {
            tags: ['Owner Users'],
            summary: 'List owner users',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, listController);

    app.post('/owner/users', {
        schema: {
            tags: ['Owner Users'],
            summary: 'Create owner user',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, createController);

    app.get('/owner/users/:id', {
        schema: {
            tags: ['Owner Users'],
            summary: 'Get owner user',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, getController);

    app.patch('/owner/users/:id', {
        schema: {
            tags: ['Owner Users'],
            summary: 'Update owner user',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, updateController);

    app.delete('/owner/users/:id', {
        schema: {
            tags: ['Owner Users'],
            summary: 'Delete owner user',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, deleteController);
}
