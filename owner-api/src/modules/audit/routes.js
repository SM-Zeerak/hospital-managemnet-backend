import { createListAuditController, createCreateAuditController } from './controller.js';

export function registerAuditRoutes(app) {
    const listController = createListAuditController(app);
    const createController = createCreateAuditController(app);

    const authGuard = app.authGuard;
    const allowAdmins = app.roleGuard(['super-admin', 'admin']);

    app.get('/owner/audit', {
        schema: {
            tags: ['Audit'],
            summary: 'List audit events',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowAdmins]
    }, listController);

    app.post('/owner/audit', {
        schema: {
            tags: ['Audit'],
            summary: 'Create audit event',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowAdmins]
    }, createController);
}
