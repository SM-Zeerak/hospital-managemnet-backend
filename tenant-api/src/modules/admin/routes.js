import {
    createGetSubscriptionController,
    createListFeaturesController,
    createGetTemplateVersionController,
    createApplyTemplateController
} from './controller.js';

export function registerAdminRoutes(app) {
    const authGuard = app.authGuard;
    const adminRoles = app.roleGuard(['admin', 'sub-admin']);
    const subscriptionController = createGetSubscriptionController(app);
    const featuresController = createListFeaturesController(app);
    const versionController = createGetTemplateVersionController(app);
    const applyController = createApplyTemplateController(app);

    app.get('/admin/subscription', {
        preHandler: [authGuard, adminRoles]
    }, subscriptionController);

    app.get('/admin/features', {
        preHandler: [authGuard, adminRoles]
    }, featuresController);

    app.get('/admin/template-version', {
        preHandler: [authGuard, adminRoles]
    }, versionController);

    app.post('/admin/apply-template', {
        preHandler: [authGuard, adminRoles]
    }, applyController);
}


