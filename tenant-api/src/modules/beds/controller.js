import {
    createBedSchema,
    updateBedSchema,
    idParamSchema,
    listBedsQuerySchema
} from './schemas.js';
import {
    listBeds,
    createBed,
    findBedById,
    updateBed,
    deleteBed
} from './service.js';

export function createListBedsController(app) {
    return async function listBedsController(request) {
        const query = listBedsQuerySchema.parse(request.query);
        const result = await listBeds(app.db.models, query);
        return {
            ok: true,
            status: 200,
            invokedMethod: 'List Beds',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            ...result
        };
    };
}

export function createCreateBedController(app) {
    return async function createBedController(request) {
        const payload = createBedSchema.parse(request.body);
        const bed = await createBed(app.db.models, payload);

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('bed.created', { id: bed.id });

        return {
            ok: true,
            status: 201,
            invokedMethod: 'Create Bed',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: bed
        };
    };
}

export function createGetBedController(app) {
    return async function getBedController(request) {
        const { id } = idParamSchema.parse(request.params);
        const bed = await findBedById(app.db.models, id);
        if (!bed) {
            throw app.httpErrors.notFound('Bed not found');
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Get Bed',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: bed
        };
    };
}

export function createUpdateBedController(app) {
    return async function updateBedController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updateBedSchema.parse(request.body);

        const bed = await updateBed(app.db.models, id, payload);
        if (!bed) {
            throw app.httpErrors.notFound('Bed not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('bed.updated', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Update Bed',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: bed
        };
    };
}

export function createDeleteBedController(app) {
    return async function deleteBedController(request) {
        const { id } = idParamSchema.parse(request.params);
        const bed = await deleteBed(app.db.models, id);
        if (!bed) {
            throw app.httpErrors.notFound('Bed not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('bed.deleted', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Delete Bed',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: { id }
        };
    };
}
