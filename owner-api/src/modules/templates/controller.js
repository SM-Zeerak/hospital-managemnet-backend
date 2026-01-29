import {
    listQuerySchema,
    templateParamsSchema,
    createTemplateSchema,
    updateTemplateSchema,
    diffQuerySchema
} from './schemas.js';
import {
    listTemplates,
    createTemplate,
    findTemplateById,
    updateTemplate,
    archiveTemplate,
    getGlobalTemplateVersion,
    bumpGlobalTemplateVersion,
    listTemplateAudits
} from './service.js';
import { scheduleTemplateChangeDispatch } from './events.js';

function withGlobalVersionResponse(data, globalVersion) {
    return {
        ok: true,
        data,
        meta: {
            globalVersion
        }
    };
}

export function createListTemplatesController(app) {
    return async function listTemplatesController(request) {
        const query = listQuerySchema.parse(request.query ?? {});
        const [templates, version] = await Promise.all([
            listTemplates(app.db.models, query),
            getGlobalTemplateVersion(app.db.models)
        ]);

        return withGlobalVersionResponse(templates, version);
    };
}

export function createGetTemplateController(app) {
    return async function getTemplateController(request) {
        const { id } = templateParamsSchema.parse(request.params);
        const template = await findTemplateById(app.db.models, id);
        if (!template) {
            throw app.httpErrors.notFound('Template not found');
        }

        const version = await getGlobalTemplateVersion(app.db.models);
        return withGlobalVersionResponse(template, version);
    };
}

export function createCreateTemplateController(app) {
    return async function createTemplateController(request) {
        const payload = createTemplateSchema.parse(request.body);
        const template = await createTemplate(app.db.models, payload);
        const version = await getGlobalTemplateVersion(app.db.models);
        scheduleTemplateChangeDispatch(app, 'template.created', template, {
            user: request.user,
            version
        });
        return withGlobalVersionResponse(template, version);
    };
}

export function createUpdateTemplateController(app) {
    return async function updateTemplateController(request) {
        const { id } = templateParamsSchema.parse(request.params);
        const payload = updateTemplateSchema.parse(request.body || {});
        const existing = await findTemplateById(app.db.models, id);
        if (!existing) {
            throw app.httpErrors.notFound('Template not found');
        }

        const previous = existing.toJSON();
        const template = await updateTemplate(app.db.models, id, payload);
        const version = await getGlobalTemplateVersion(app.db.models);
        scheduleTemplateChangeDispatch(app, 'template.updated', template, {
            user: request.user,
            previous,
            version
        });
        return withGlobalVersionResponse(template, version);
    };
}

export function createArchiveTemplateController(app) {
    return async function archiveTemplateController(request) {
        const { id } = templateParamsSchema.parse(request.params);
        const existing = await findTemplateById(app.db.models, id);
        if (!existing) {
            throw app.httpErrors.notFound('Template not found');
        }

        const previous = existing.toJSON();
        const template = await archiveTemplate(app.db.models, id);
        const version = await getGlobalTemplateVersion(app.db.models);
        scheduleTemplateChangeDispatch(app, 'template.archived', template, {
            user: request.user,
            previous,
            version
        });
        return withGlobalVersionResponse({ id }, version);
    };
}

export function createTemplateVersionController(app) {
    return async function templateVersionController() {
        const version = await getGlobalTemplateVersion(app.db.models);
        return withGlobalVersionResponse(null, version);
    };
}

export function createTemplateVersionBumpController(app) {
    return async function templateVersionBumpController(request) {
        const currentVersion = await getGlobalTemplateVersion(app.db.models);
        const version = await bumpGlobalTemplateVersion(app.db.models);
        scheduleTemplateChangeDispatch(app, 'template.version.bumped', null, {
            user: request.user,
            version,
            diff: {
                before: { version: currentVersion },
                after: { version },
                changedFields: ['version']
            }
        });
        return withGlobalVersionResponse(null, version);
    };
}

export function createTemplateDiffController(app) {
    return async function templateDiffController(request) {
        const query = diffQuerySchema.parse(request.query ?? {});
        const version = await getGlobalTemplateVersion(app.db.models);
        if (query.full) {
            const templates = await listTemplates(app.db.models, {});
            const data = templates.map((template) => {
                const plain = typeof template.toJSON === 'function' ? template.toJSON() : template;
                return {
                    id: plain.id,
                    templateId: plain.id,
                    key: plain.key,
                    name: plain.name,
                    type: plain.type,
                    description: plain.description,
                    content: plain.content,
                    metadata: plain.metadata ?? {},
                    version: plain.version ?? version,
                    isActive: plain.isActive ?? true,
                    changeType: 'full-sync',
                    diff: {
                        before: null,
                        after: plain,
                        changedFields: Object.keys(plain)
                    },
                    triggeredBy: 'owner-system',
                    auditedAt: plain.updatedAt ?? plain.createdAt ?? null
                };
            });

            return withGlobalVersionResponse(data, version);
        }

        const audits = await listTemplateAudits(app.db.models, {
            since: query.since,
            limit: query.limit
        });
        const data = audits.map((audit) => {
            const plain = typeof audit.toJSON === 'function' ? audit.toJSON() : audit;
            const template = plain.template || {};
            const afterSnapshot = plain.diff?.after || {};

            return {
                id: template.id ?? plain.templateId ?? null,
                templateId: template.id ?? plain.templateId ?? null,
                key: template.key ?? afterSnapshot.key ?? null,
                name: template.name ?? afterSnapshot.name ?? null,
                type: template.type ?? afterSnapshot.type ?? null,
                description: template.description ?? afterSnapshot.description ?? null,
                content: template.content ?? afterSnapshot.content ?? null,
                metadata: template.metadata ?? afterSnapshot.metadata ?? {},
                version: plain.version ?? template.version ?? afterSnapshot.version ?? null,
                isActive: template.isActive ?? afterSnapshot.isActive ?? null,
                changeType: plain.changeType,
                diff: plain.diff,
                triggeredBy: plain.triggeredBy ?? null,
                auditedAt: plain.createdAt ?? null
            };
        });

        return withGlobalVersionResponse(data, version);
    };
}
