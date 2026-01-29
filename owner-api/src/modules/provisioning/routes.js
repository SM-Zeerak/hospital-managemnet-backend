import {
    createProvisionTenantController,
    createProvisioningStatusController
} from './controller.js';

export function registerProvisioningRoutes(app) {
    const provisionController = createProvisionTenantController(app);
    const statusController = createProvisioningStatusController(app);

    const authGuard = app.authGuard;
    const allowSuperAdmin = app.roleGuard(['super-admin']);

    app.post('/owner/tenants/:id/provision', {
        schema: {
            tags: ['Provisioning'],
            summary: 'Provision tenant',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, provisionController);

    app.get('/owner/provisioning/status', {
        schema: {
            tags: ['Provisioning'],
            summary: 'Provisioning status',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, statusController);
}
