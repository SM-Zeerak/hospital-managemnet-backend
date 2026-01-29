import {
    createFeatureSchema,
    updateFeatureSchema,
    featureIdParamSchema,
    tenantIdParamSchema,
    upsertTenantFeaturesSchema
} from './schemas.js';
import {
    listFeatures,
    createFeature,
    findFeatureById,
    updateFeature,
    deleteFeature,
    listTenantFeatures,
    upsertTenantFeatures
} from './service.js';

export function createListFeaturesController(app) {
    return async function listFeaturesController() {
        const features = await listFeatures(app.db.models);
        return {
            ok: true,
            data: features
        };
    };
}

export function createCreateFeatureController(app) {
    return async function createFeatureController(request) {
        const payload = createFeatureSchema.parse(request.body);
        const feature = await createFeature(app.db.models, payload);
        return {
            ok: true,
            data: feature
        };
    };
}

export function createGetFeatureController(app) {
    return async function getFeatureController(request) {
        const { id } = featureIdParamSchema.parse(request.params);
        const feature = await findFeatureById(app.db.models, id);
        if (!feature) {
            throw app.httpErrors.notFound('Feature not found');
        }

        return {
            ok: true,
            data: feature
        };
    };
}

export function createUpdateFeatureController(app) {
    return async function updateFeatureController(request) {
        const { id } = featureIdParamSchema.parse(request.params);
        const payload = updateFeatureSchema.parse(request.body);
        const feature = await updateFeature(app.db.models, id, payload);
        if (!feature) {
            throw app.httpErrors.notFound('Feature not found');
        }

        return {
            ok: true,
            data: feature
        };
    };
}

export function createDeleteFeatureController(app) {
    return async function deleteFeatureController(request) {
        const { id } = featureIdParamSchema.parse(request.params);
        const feature = await deleteFeature(app.db.models, id);
        if (!feature) {
            throw app.httpErrors.notFound('Feature not found');
        }

        return {
            ok: true,
            data: { id }
        };
    };
}

export function createTenantFeaturesListController(app) {
    return async function tenantFeaturesListController(request) {
        const { tenantId } = tenantIdParamSchema.parse(request.params);
        const rows = await listTenantFeatures(app.db.models, tenantId);
        return {
            ok: true,
            data: rows
        };
    };
}

export function createTenantFeaturesUpsertController(app) {
    return async function tenantFeaturesUpsertController(request) {
        const { tenantId } = tenantIdParamSchema.parse(request.params);
        const { features } = upsertTenantFeaturesSchema.parse(request.body);
        const rows = await upsertTenantFeatures(app.db.models, tenantId, features);
        return {
            ok: true,
            data: rows
        };
    };
}
