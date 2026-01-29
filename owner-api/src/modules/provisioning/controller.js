import {
    provisionTenantPathSchema,
    provisionTenantBodySchema,
    provisioningStatusSchema
} from './schemas.js';
import { enqueueProvisioningWorkflow, getProvisioningStatus } from './service.js';

export function createProvisionTenantController(app) {
    return async function provisionTenantController(request) {
        const { id } = provisionTenantPathSchema.parse(request.params);
        const body = provisionTenantBodySchema.parse(request.body ?? {});
        const result = await enqueueProvisioningWorkflow(app, {
            tenantId: id,
            force: body.force ?? false
        });
        return {
            ok: true,
            data: result
        };
    };
}

export function createProvisioningStatusController(app) {
    return async function provisioningStatusController(request) {
        const { tenantId } = provisioningStatusSchema.parse(request.query);
        const result = await getProvisioningStatus(app, tenantId);
        return {
            ok: true,
            data: result
        };
    };
}
