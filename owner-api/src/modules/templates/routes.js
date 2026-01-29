import {
    createListTemplatesController,
    createGetTemplateController,
    createCreateTemplateController,
    createUpdateTemplateController,
    createArchiveTemplateController,
    createTemplateVersionController,
    createTemplateVersionBumpController,
    createTemplateDiffController
} from './controller.js';

export function registerTemplateRoutes(app) {
    const listTemplates = createListTemplatesController(app);
    const getTemplate = createGetTemplateController(app);
    const createTemplate = createCreateTemplateController(app);
    const updateTemplate = createUpdateTemplateController(app);
    const archiveTemplate = createArchiveTemplateController(app);
    const versionController = createTemplateVersionController(app);
    const bumpController = createTemplateVersionBumpController(app);
    const diffController = createTemplateDiffController(app);

    const adminGuard = app.roleGuard(['super-admin', 'admin']);

    app.get('/owner/templates', {
        schema: {
            tags: ['Templates'],
            summary: 'List templates',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [adminGuard]
    }, listTemplates);

    app.get('/owner/templates/:id', {
        schema: {
            tags: ['Templates'],
            summary: 'Get template',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [adminGuard]
    }, getTemplate);

    app.post('/owner/templates', {
        schema: {
            tags: ['Templates'],
            summary: 'Create template',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [app.allowSuperAdmin]
    }, createTemplate);

    app.put('/owner/templates/:id', {
        schema: {
            tags: ['Templates'],
            summary: 'Update template',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [app.allowSuperAdmin]
    }, updateTemplate);

    app.delete('/owner/templates/:id', {
        schema: {
            tags: ['Templates'],
            summary: 'Archive template',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [app.allowSuperAdmin]
    }, archiveTemplate);

    app.get('/owner/templates/version', {
        schema: {
            tags: ['Templates'],
            summary: 'Get template version info',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [adminGuard]
    }, versionController);

    app.post('/owner/templates/version', {
        schema: {
            tags: ['Templates'],
            summary: 'Bump template version',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [app.allowSuperAdmin]
    }, bumpController);

    app.get('/owner/templates/diff', {
        schema: {
            tags: ['Templates'],
            summary: 'Diff templates',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [adminGuard]
    }, diffController);

    app.get('/owner/export/templates', {
        schema: {
            tags: ['Templates'],
            summary: 'Export templates (sync)',
            description: 'Sync export endpoint guarded by sync token'
        },
        preHandler: [app.syncGuard]
    }, diffController);
}
