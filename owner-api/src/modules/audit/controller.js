import { listAuditQuerySchema, createAuditSchema } from './schemas.js';
import { listAuditEvents, createAuditEvent } from './service.js';

export function createListAuditController(app) {
    return async function listAuditController(request) {
        const { tenantId, step, status, page, limit } = listAuditQuerySchema.parse(request.query);
        const result = await listAuditEvents(app.db.models, { tenantId, step, status, page, limit });
        return {
            ok: true,
            data: result.data,
            meta: result.meta
        };
    };
}

export function createCreateAuditController(app) {
    return async function createAuditController(request) {
        const payload = createAuditSchema.parse(request.body);
        const audit = await createAuditEvent(app.db.models, payload);
        return {
            ok: true,
            data: audit
        };
    };
}
