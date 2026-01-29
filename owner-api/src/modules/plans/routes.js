import {
    createListPlansController,
    createCreatePlanController,
    createGetPlanController,
    createUpdatePlanController,
    createDeletePlanController
} from './controller.js';

export function registerPlanRoutes(app) {
    const listController = createListPlansController(app);
    const createController = createCreatePlanController(app);
    const getController = createGetPlanController(app);
    const updateController = createUpdatePlanController(app);
    const deleteController = createDeletePlanController(app);

    const authGuard = app.authGuard;
    const allowEditors = app.roleGuard(['super-admin', 'admin']);

    app.get('/owner/plans', {
        schema: {
            tags: ['Plans'],
            summary: 'List plans',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard]
    }, listController);

    app.post('/owner/plans', {
        schema: {
            tags: ['Plans'],
            summary: 'Create plan',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, createController);

    app.get('/owner/plans/:id', {
        schema: {
            tags: ['Plans'],
            summary: 'Get plan',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard]
    }, getController);

    app.patch('/owner/plans/:id', {
        schema: {
            tags: ['Plans'],
            summary: 'Update plan',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, updateController);

    app.delete('/owner/plans/:id', {
        schema: {
            tags: ['Plans'],
            summary: 'Delete plan',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowEditors]
    }, deleteController);
}
