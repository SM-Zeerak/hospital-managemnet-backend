import {
    createGetSubscriptionController,
    createUpsertSubscriptionController
} from './controller.js';

export function registerSubscriptionRoutes(app) {
    const getController = createGetSubscriptionController(app);
    const upsertController = createUpsertSubscriptionController(app);

    const authGuard = app.authGuard;
    const allowAdmins = app.roleGuard(['super-admin', 'admin']);

    app.get('/owner/subscriptions/:tenantId', {
        schema: {
            tags: ['Subscriptions'],
            summary: 'Get subscription',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowAdmins]
    }, getController);

    app.get('/owner/export/subscriptions/:tenantId', {
        schema: {
            tags: ['Subscriptions'],
            summary: 'Export subscription (sync)',
            description: 'Sync export endpoint guarded by sync token'
        },
        preHandler: [app.syncGuard]
    }, getController);

    app.put('/owner/subscriptions/:tenantId', {
        schema: {
            tags: ['Subscriptions'],
            summary: 'Upsert subscription',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowAdmins]
    }, upsertController);
}
