import { featureQuerySchema, applyTemplateSchema } from './schemas.js';
import { getSubscription, listFeatures, getTemplateVersion, applyRoleTemplate } from './service.js';

export function createGetSubscriptionController(app) {
    return async function getSubscriptionController(request) {
        const record = await getSubscription(app.db.models);
        return {
            ok: true,
            data: record
        };
    };
}

export function createListFeaturesController(app) {
    return async function listFeaturesController(request) {
        const query = featureQuerySchema.parse(request.query ?? {});
        const records = await listFeatures(app.db.models, query);
        return {
            ok: true,
            data: records
        };
    };
}

export function createGetTemplateVersionController(app) {
    return async function getTemplateVersionController() {
        const version = await getTemplateVersion(app.db.models);
        return {
            ok: true,
            data: {
                globalVersion: version
            }
        };
    };
}

export function createApplyTemplateController(app) {
    return async function applyTemplateController(request) {
        const payload = applyTemplateSchema.parse(request.body ?? {});
        const result = await applyRoleTemplate(app.db.models, payload);
        app.log.info({
            module: 'admin',
            action: 'apply-template',
            summary: result
        }, 'Role template applied');
        return {
            ok: true,
            data: result
        };
    };
}


