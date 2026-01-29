import {
    createListFeaturesController,
    createCreateFeatureController,
    createGetFeatureController,
    createUpdateFeatureController,
    createDeleteFeatureController,
    createTenantFeaturesListController,
    createTenantFeaturesUpsertController
} from './controller.js';

export function registerFeatureRoutes(app) {
    const listController = createListFeaturesController(app);
    const createController = createCreateFeatureController(app);
    const getController = createGetFeatureController(app);
    const updateController = createUpdateFeatureController(app);
    const deleteController = createDeleteFeatureController(app);
    const tenantListController = createTenantFeaturesListController(app);
    const tenantUpsertController = createTenantFeaturesUpsertController(app);

    const authGuard = app.authGuard;
    const allowEditors = app.roleGuard(['super-admin', 'admin']);

    app.get('/owner/features', {
        schema: {
            tags: ['Features'],
            summary: 'List features',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard]
    }, listController);

    app.get('/owner/export/features', {
        schema: {
            tags: ['Features'],
            summary: 'Export features (sync)',
            description: 'Sync export endpoint guarded by sync token'
        },
        preHandler: [app.syncGuard]
    }, listController);

    app.get('/owner/export/tenants/:tenantId/features', {
        schema: {
            tags: ['Features'],
            summary: 'Export tenant features (sync)',
            description: 'Sync export endpoint guarded by sync token'
        },
        preHandler: [app.syncGuard]
    }, tenantListController);

    app.post('/owner/features', {
        schema: {
            tags: ['Features'],
            summary: 'Create feature',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, createController);

    app.get('/owner/features/:id', {
        schema: {
            tags: ['Features'],
            summary: 'Get feature',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard]
    }, getController);

    app.patch('/owner/features/:id', {
        schema: {
            tags: ['Features'],
            summary: 'Update feature',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, updateController);

    app.delete('/owner/features/:id', {
        schema: {
            tags: ['Features'],
            summary: 'Delete feature',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, deleteController);

    app.get('/owner/tenants/:tenantId/features', {
        schema: {
            tags: ['Features'],
            summary: 'List tenant features',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, tenantListController);

    app.patch('/owner/tenants/:tenantId/features', {
        schema: {
            tags: ['Features'],
            summary: 'Upsert tenant features',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, tenantUpsertController);
}
