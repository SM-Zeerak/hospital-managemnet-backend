import fp from 'fastify-plugin';
import { StaffController } from './controller.js';
import { StaffService } from './service.js';
import {
    createStaffSchema,
    updateStaffSchema,
    deleteStaffSchema,
    getStaffSchema,
    listStaffSchema
} from './schemas.js';

export const registerStaffModule = fp(async (app) => {
    const staffService = new StaffService(app.db);
    const staffController = new StaffController(staffService);

    // Create staff (requires authentication and staff:create permission or super-admin)
    app.post('/staff', {
        schema: createStaffSchema,
        preHandler: [
            app.authGuard,
            // Super admin can create, or staff with staff:create permission
            async (request) => {
                if (request.user?.type === 'super-admin') {
                    return; // Super admin has all permissions
                }
                if (request.user?.type === 'staff') {
                    const permissions = request.user?.permissions || [];
                    if (!permissions.includes('staff:create')) {
                        throw app.httpErrors.forbidden('Permission required: staff:create');
                    }
                } else {
                    throw app.httpErrors.forbidden('Staff or super-admin access required');
                }
            },
            app.validateBody(createStaffSchema.shape.body)
        ]
    }, async (request, reply) => {
        return staffController.create(request, reply);
    });

    // List all staff (requires authentication and staff:list permission or super-admin)
    app.get('/staff', {
        schema: listStaffSchema,
        preHandler: [
            app.authGuard,
            async (request) => {
                if (request.user?.type === 'super-admin') {
                    return; // Super admin has all permissions
                }
                if (request.user?.type === 'staff') {
                    const permissions = request.user?.permissions || [];
                    if (!permissions.includes('staff:list')) {
                        throw app.httpErrors.forbidden('Permission required: staff:list');
                    }
                } else {
                    throw app.httpErrors.forbidden('Staff or super-admin access required');
                }
            },
            app.validateQuery(listStaffSchema.shape.query)
        ]
    }, async (request, reply) => {
        return staffController.list(request, reply);
    });

    // Get staff by ID (requires authentication and staff:view permission or super-admin)
    app.get('/staff/:id', {
        schema: getStaffSchema,
        preHandler: [
            app.authGuard,
            async (request) => {
                if (request.user?.type === 'super-admin') {
                    return; // Super admin has all permissions
                }
                if (request.user?.type === 'staff') {
                    const permissions = request.user?.permissions || [];
                    // Allow viewing own profile or require staff:view permission
                    if (request.params.id !== request.user.id && !permissions.includes('staff:view')) {
                        throw app.httpErrors.forbidden('Permission required: staff:view');
                    }
                } else {
                    throw app.httpErrors.forbidden('Staff or super-admin access required');
                }
            },
            app.validateParams(getStaffSchema.shape.params)
        ]
    }, async (request, reply) => {
        return staffController.getById(request, reply);
    });

    // Update staff (requires authentication and staff:update permission or super-admin)
    app.put('/staff/:id', {
        schema: updateStaffSchema,
        preHandler: [
            app.authGuard,
            async (request) => {
                if (request.user?.type === 'super-admin') {
                    return; // Super admin has all permissions
                }
                if (request.user?.type === 'staff') {
                    const permissions = request.user?.permissions || [];
                    // Allow updating own profile or require staff:update permission
                    if (request.params.id !== request.user.id && !permissions.includes('staff:update')) {
                        throw app.httpErrors.forbidden('Permission required: staff:update');
                    }
                } else {
                    throw app.httpErrors.forbidden('Staff or super-admin access required');
                }
            },
            app.validateParams(updateStaffSchema.shape.params),
            app.validateBody(updateStaffSchema.shape.body)
        ]
    }, async (request, reply) => {
        return staffController.update(request, reply);
    });

    // Delete staff (requires authentication and staff:delete permission or super-admin)
    app.delete('/staff/:id', {
        schema: deleteStaffSchema,
        preHandler: [
            app.authGuard,
            async (request) => {
                if (request.user?.type === 'super-admin') {
                    return; // Super admin has all permissions
                }
                if (request.user?.type === 'staff') {
                    const permissions = request.user?.permissions || [];
                    if (!permissions.includes('staff:delete')) {
                        throw app.httpErrors.forbidden('Permission required: staff:delete');
                    }
                } else {
                    throw app.httpErrors.forbidden('Staff or super-admin access required');
                }
            },
            app.validateParams(deleteStaffSchema.shape.params)
        ]
    }, async (request, reply) => {
        return staffController.delete(request, reply);
    });
});

