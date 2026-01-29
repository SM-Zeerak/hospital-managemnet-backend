import {
    createVpsNodeSchema,
    updateVpsNodeSchema,
    idParamSchema,
    capacityCheckSchema
} from './schemas.js';
import {
    listVpsNodes,
    createVpsNode,
    updateVpsNode,
    deleteVpsNode,
    checkCapacity
} from './service.js';

export function createListVpsNodesController(app) {
    return async function listController() {
        const nodes = await listVpsNodes(app.db.models);
        return {
            ok: true,
            data: nodes
        };
    };
}

export function createCreateVpsNodeController(app) {
    return async function createController(request) {
        const payload = createVpsNodeSchema.parse(request.body);
        const node = await createVpsNode(app.db.models, payload);
        return {
            ok: true,
            data: node
        };
    };
}

export function createUpdateVpsNodeController(app) {
    return async function updateController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updateVpsNodeSchema.parse(request.body);
        const node = await updateVpsNode(app.db.models, id, payload);
        if (!node) {
            throw app.httpErrors.notFound('VPS node not found');
        }

        return {
            ok: true,
            data: node
        };
    };
}

export function createDeleteVpsNodeController(app) {
    return async function deleteController(request) {
        const { id } = idParamSchema.parse(request.params);
        const node = await deleteVpsNode(app.db.models, id);
        if (!node) {
            throw app.httpErrors.notFound('VPS node not found');
        }

        return {
            ok: true,
            data: { id }
        };
    };
}

export function createCheckCapacityController(app) {
    return async function checkController(request) {
        const { id } = idParamSchema.parse(request.params);
        const { tenants } = capacityCheckSchema.parse(request.body);
        const result = await checkCapacity(app.db.models, id, tenants);
        if (!result) {
            throw app.httpErrors.notFound('VPS node not found');
        }

        return {
            ok: true,
            data: result
        };
    };
}
