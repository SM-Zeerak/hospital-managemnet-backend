import {
    createPermissionSchema,
    updatePermissionSchema,
    idParamSchema,
    listPermissionsQuerySchema
} from './schemas.js';
import {
    listPermissions,
    createPermission,
    findPermissionById,
    updatePermission,
    deletePermission
} from './service.js';
import { getUserHighestRoleLevel } from '../users/utils.js';

export function createListPermissionsController(app) {
    return async function listPermissionsController(request) {
        const requesterRoles = request.user?.roles || [];
        
        // Only admin (level 3) and sub-admin (level 2) can access permissions
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            if (requesterLevel < 2) {
                throw app.httpErrors.forbidden('Insufficient role level to view permissions. Only administrators can access this resource.');
            }
        }
        
        const query = listPermissionsQuerySchema.parse(request.query);
        const result = await listPermissions(app.db.models, query);
        return {
            ok: true,
            status: 200,
            invokedMethod: 'List Permissions',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            ...result
        };
    };
}

export function createCreatePermissionController(app) {
    return async function createPermissionController(request) {
        const payload = createPermissionSchema.parse(request.body);
        const permission = await createPermission(app.db.models, payload);
        
        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('permission.created', { id: permission.id });
        
        return {
            ok: true,
            status: 201,
            invokedMethod: 'Create Permission',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: permission
        };
    };
}

export function createGetPermissionController(app) {
    return async function getPermissionController(request) {
        const requesterRoles = request.user?.roles || [];
        
        // Only admin (level 3) and sub-admin (level 2) can access permissions
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            if (requesterLevel < 2) {
                throw app.httpErrors.forbidden('Insufficient role level to view permissions. Only administrators can access this resource.');
            }
        }
        
        const { id } = idParamSchema.parse(request.params);
        const permission = await findPermissionById(app.db.models, id);
        if (!permission) {
            throw app.httpErrors.notFound('Permission not found');
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Get Permission',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: permission
        };
    };
}

export function createUpdatePermissionController(app) {
    return async function updatePermissionController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updatePermissionSchema.parse(request.body);
        const permission = await updatePermission(app.db.models, id, payload);
        if (!permission) {
            throw app.httpErrors.notFound('Permission not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('permission.updated', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Update Permission',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: permission
        };
    };
}

export function createDeletePermissionController(app) {
    return async function deletePermissionController(request) {
        const { id } = idParamSchema.parse(request.params);
        const permission = await deletePermission(app.db.models, id);
        if (!permission) {
            throw app.httpErrors.notFound('Permission not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('permission.deleted', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Delete Permission',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: { id }
        };
    };
}
