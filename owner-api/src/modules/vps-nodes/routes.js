import {
    createListVpsNodesController,
    createCreateVpsNodeController,
    createUpdateVpsNodeController,
    createDeleteVpsNodeController,
    createCheckCapacityController
} from './controller.js';

export function registerVpsNodeRoutes(app) {
    const listController = createListVpsNodesController(app);
    const createController = createCreateVpsNodeController(app);
    const updateController = createUpdateVpsNodeController(app);
    const deleteController = createDeleteVpsNodeController(app);
    const checkController = createCheckCapacityController(app);

    const authGuard = app.authGuard;
    const allowEditors = app.roleGuard(['super-admin', 'admin']);

    app.get('/owner/vps-nodes', {
        schema: {
            tags: ['VPS Nodes'],
            summary: 'List VPS nodes',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard]
    }, listController);

    app.post('/owner/vps-nodes', {
        schema: {
            tags: ['VPS Nodes'],
            summary: 'Create VPS node',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, createController);

    app.patch('/owner/vps-nodes/:id', {
        schema: {
            tags: ['VPS Nodes'],
            summary: 'Update VPS node',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, updateController);

    app.delete('/owner/vps-nodes/:id', {
        schema: {
            tags: ['VPS Nodes'],
            summary: 'Delete VPS node',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, deleteController);

    app.post('/owner/vps-nodes/:id/check-capacity', {
        schema: {
            tags: ['VPS Nodes'],
            summary: 'Check VPS node capacity',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, checkController);
}
