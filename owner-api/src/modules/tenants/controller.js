import {
    listTenantsQuerySchema,
    tenantIdParamSchema,
    createTenantSchema,
    updateTenantSchema,
    createTenantUserSchema,
    listTenantUsersQuerySchema
} from './schemas.js';
import {
    listTenants,
    createTenant,
    findTenantById,
    updateTenant,
    notifyTenantSync,
    checkTenantDatabaseHealth,
    listTenantUsers,
    createTenantUser
} from './service.js';

export function createListTenantsController(app) {
    return async function listTenantsController(request) {
        const { page, limit, status, search } = listTenantsQuerySchema.parse(request.query);
        const result = await listTenants(app.db.models, { page, limit, status, search });
        return {
            ok: true,
            data: result.data,
            meta: result.meta
        };
    };
}

export function createCreateTenantController(app) {
    return async function createTenantController(request) {
        const payload = createTenantSchema.parse(request.body);
        try {
            const tenant = await createTenant(app.db.models, payload);
            return {
                ok: true,
                data: tenant,
                message: 'Tenant created successfully. First admin user has been created.'
            };
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('seeders')) {
                throw app.httpErrors.badRequest(error.message);
            }
            throw app.httpErrors.internalServerError(error.message || 'Failed to create tenant');
        }
    };
}

export function createGetTenantController(app) {
    return async function getTenantController(request) {
        const { id } = tenantIdParamSchema.parse(request.params);
        const tenant = await findTenantById(app.db.models, id);
        if (!tenant) {
            throw app.httpErrors.notFound('Tenant not found');
        }

        return {
            ok: true,
            data: tenant
        };
    };
}

export function createUpdateTenantController(app) {
    return async function updateTenantController(request) {
        const { id } = tenantIdParamSchema.parse(request.params);
        const payload = updateTenantSchema.parse(request.body);

        const tenant = await updateTenant(app.db.models, id, payload);
        if (!tenant) {
            throw app.httpErrors.notFound('Tenant not found');
        }

        return {
            ok: true,
            data: tenant
        };
    };
}

export function createNotifyTenantSyncController(app) {
    return async function notifyTenantSyncController(request) {
        const { id } = tenantIdParamSchema.parse(request.params);
        const result = await notifyTenantSync(app, id, {
            triggeredBy: request.user?.email || request.user?.id || 'owner-admin',
            reason: 'manual_trigger'
        });

        if (!result.ok) {
            switch (result.status) {
                case 400:
                    throw app.httpErrors.badRequest(result.message);
                case 404:
                    throw app.httpErrors.notFound(result.message);
                case 401:
                    throw app.httpErrors.unauthorized(result.message || 'Unauthorized');
                case 403:
                    throw app.httpErrors.forbidden(result.message || 'Forbidden');
                case 503:
                    throw app.httpErrors.serviceUnavailable(result.message || 'Tenant sync unavailable');
                default:
                    throw app.httpErrors.internalServerError(result.message || 'Tenant sync failed');
            }
        }

        return {
            ok: true,
            data: {
                status: result.status,
                response: result.response || null
            }
        };
    };
}

export function createCheckTenantDatabaseHealthController(app) {
    return async function checkTenantDatabaseHealthController(request) {
        const { id } = tenantIdParamSchema.parse(request.params);
        const result = await checkTenantDatabaseHealth(app, id);

        if (result.status === 404) {
            throw app.httpErrors.notFound(result.message);
        }

        return {
            ok: result.ok,
            data: result.health
        };
    };
}

export function createListTenantUsersController(app) {
    return async function listTenantUsersController(request) {
        const { id } = tenantIdParamSchema.parse(request.params);
        const query = listTenantUsersQuerySchema.parse(request.query);
        
        const result = await listTenantUsers(app, id, query);
        
        if (!result.ok) {
            switch (result.status) {
                case 404:
                    throw app.httpErrors.notFound(result.message);
                case 500:
                    throw app.httpErrors.internalServerError(result.message);
                default:
                    throw app.httpErrors.internalServerError('Failed to list tenant users');
            }
        }

        return {
            ok: true,
            data: result.data,
            meta: result.meta
        };
    };
}

export function createCreateTenantUserController(app) {
    return async function createTenantUserController(request) {
        const { id } = tenantIdParamSchema.parse(request.params);
        const payload = createTenantUserSchema.parse(request.body);
        
        const result = await createTenantUser(app, id, payload);
        
        if (!result.ok) {
            switch (result.status) {
                case 404:
                    throw app.httpErrors.notFound(result.message);
                case 409:
                    throw app.httpErrors.conflict(result.message);
                case 500:
                    throw app.httpErrors.internalServerError(result.message);
                default:
                    throw app.httpErrors.internalServerError('Failed to create tenant user');
            }
        }

        return {
            ok: true,
            data: result.data,
            message: 'User created successfully for tenant'
        };
    };
}
