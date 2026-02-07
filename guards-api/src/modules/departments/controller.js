import {
    createDepartmentSchema,
    updateDepartmentSchema,
    idParamSchema,
    listDepartmentsQuerySchema
} from './schemas.js';
import {
    listDepartments,
    createDepartment,
    findDepartmentById,
    updateDepartment,
    deleteDepartment
} from './service.js';
import { getUserHighestRoleLevel } from '../users/utils.js';

export function createListDepartmentsController(app) {
    return async function listDepartmentsController(request) {
        const requesterRoles = request.user?.roles || [];
        
        // Only admin (level 3) and sub-admin (level 2) can access departments
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            if (requesterLevel < 2) {
                throw app.httpErrors.forbidden('Insufficient role level to view departments. Only administrators can access this resource.');
            }
        }
        
        const query = listDepartmentsQuerySchema.parse(request.query);
        const result = await listDepartments(app.db.models, query);
        return {
            ok: true,
            status: 200,
            invokedMethod: 'List Departments',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            ...result
        };
    };
}

export function createCreateDepartmentController(app) {
    return async function createDepartmentController(request) {
        const payload = createDepartmentSchema.parse(request.body);
        const department = await createDepartment(app.db.models, payload);
        
        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('department.created', { id: department.id });
        
        return {
            ok: true,
            status: 201,
            invokedMethod: 'Create Department',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: department
        };
    };
}

export function createGetDepartmentController(app) {
    return async function getDepartmentController(request) {
        const requesterRoles = request.user?.roles || [];
        
        // Only admin (level 3) and sub-admin (level 2) can access departments
        if (requesterRoles.length > 0) {
            const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
            if (requesterLevel < 2) {
                throw app.httpErrors.forbidden('Insufficient role level to view departments. Only administrators can access this resource.');
            }
        }
        
        const { id } = idParamSchema.parse(request.params);
        const department = await findDepartmentById(app.db.models, id);
        if (!department) {
            throw app.httpErrors.notFound('Department not found');
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Get Department',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: department
        };
    };
}

export function createUpdateDepartmentController(app) {
    return async function updateDepartmentController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updateDepartmentSchema.parse(request.body);

        const department = await updateDepartment(app.db.models, id, payload);
        if (!department) {
            throw app.httpErrors.notFound('Department not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('department.updated', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Update Department',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: department
        };
    };
}

export function createDeleteDepartmentController(app) {
    return async function deleteDepartmentController(request) {
        const { id } = idParamSchema.parse(request.params);
        const department = await deleteDepartment(app.db.models, id);
        if (!department) {
            throw app.httpErrors.notFound('Department not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('department.deleted', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Delete Department',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: { id }
        };
    };
}
