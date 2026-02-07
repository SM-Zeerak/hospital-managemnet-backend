import {
    createRoleSchema,
    updateRoleSchema,
    idParamSchema,
    listRolesQuerySchema
} from './schemas.js';
import {
    listRoles,
    createRole,
    findRoleById,
    updateRole,
    deleteRole
} from './service.js';
import { getUserHighestRoleLevel } from '../users/utils.js';

export function createListRolesController(app) {
    return async function listRolesController(request) {
        const requesterRoles = request.user?.roles || [];
        
        // Only admin (level 3) and sub-admin (level 2) can access roles
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            if (requesterLevel < 2) {
                throw app.httpErrors.forbidden('Insufficient role level to view roles. Only administrators can access this resource.');
            }
        }
        
        const query = listRolesQuerySchema.parse(request.query);
        const result = await listRoles(app.db.models, query);
        return {
            ok: true,
            status: 200,
            invokedMethod: 'List Roles',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            ...result
        };
    };
}

export function createCreateRoleController(app) {
    return async function createRoleController(request) {
        const payload = createRoleSchema.parse(request.body);
        const role = await createRole(app.db.models, payload);
        
        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('role.created', { id: role.id });
        
        return {
            ok: true,
            status: 201,
            invokedMethod: 'Create Role',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: role
        };
    };
}

export function createGetRoleController(app) {
    return async function getRoleController(request) {
        const requesterRoles = request.user?.roles || [];
        
        // Only admin (level 3) and sub-admin (level 2) can access roles
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            if (requesterLevel < 2) {
                throw app.httpErrors.forbidden('Insufficient role level to view roles. Only administrators can access this resource.');
            }
        }
        
        const { id } = idParamSchema.parse(request.params);
        const role = await findRoleById(app.db.models, id);
        if (!role) {
            throw app.httpErrors.notFound('Role not found');
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Get Role',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: role
        };
    };
}

export function createUpdateRoleController(app) {
    return async function updateRoleController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updateRoleSchema.parse(request.body);
        const role = await updateRole(app.db.models, id, payload);
        if (!role) {
            throw app.httpErrors.notFound('Role not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('role.updated', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Update Role',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: role
        };
    };
}

export function createDeleteRoleController(app) {
    return async function deleteRoleController(request) {
        const { id } = idParamSchema.parse(request.params);
        const role = await deleteRole(app.db.models, id);
        if (!role) {
            throw app.httpErrors.notFound('Role not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('role.deleted', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Delete Role',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: { id }
        };
    };
}
