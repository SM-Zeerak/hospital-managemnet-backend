import fp from 'fastify-plugin';
import { SuperAdminController } from './controller.js';
import { SuperAdminService } from './service.js';
import {
    createSuperAdminSchema,
    updateSuperAdminSchema,
    deleteSuperAdminSchema,
    getSuperAdminSchema,
    listSuperAdminsSchema
} from './schemas.js';

export const registerSuperAdminsModule = fp(async (app) => {
    const superAdminService = new SuperAdminService(app.db);
    const superAdminController = new SuperAdminController(superAdminService);

    // Create super admin (requires super-admin role)
    app.post('/super-admins', {
        schema: createSuperAdminSchema,
        preHandler: [
            app.authGuard,
            app.allowSuperAdmin,
            app.validateBody(createSuperAdminSchema.shape.body)
        ]
    }, async (request, reply) => {
        return superAdminController.create(request, reply);
    });

    // List all super admins (requires authentication)
    app.get('/super-admins', {
        schema: listSuperAdminsSchema,
        preHandler: [
            app.authGuard,
            app.validateQuery(listSuperAdminsSchema.shape.query)
        ]
    }, async (request, reply) => {
        return superAdminController.list(request, reply);
    });

    // Get super admin by ID (requires authentication)
    app.get('/super-admins/:id', {
        schema: getSuperAdminSchema,
        preHandler: [
            app.authGuard,
            app.validateParams(getSuperAdminSchema.shape.params)
        ]
    }, async (request, reply) => {
        return superAdminController.getById(request, reply);
    });

    // Update super admin (requires super-admin role)
    app.put('/super-admins/:id', {
        schema: updateSuperAdminSchema,
        preHandler: [
            app.authGuard,
            app.allowSuperAdmin,
            app.validateParams(updateSuperAdminSchema.shape.params),
            app.validateBody(updateSuperAdminSchema.shape.body)
        ]
    }, async (request, reply) => {
        return superAdminController.update(request, reply);
    });

    // Delete super admin (requires super-admin role)
    app.delete('/super-admins/:id', {
        schema: deleteSuperAdminSchema,
        preHandler: [
            app.authGuard,
            app.allowSuperAdmin,
            app.validateParams(deleteSuperAdminSchema.shape.params)
        ]
    }, async (request, reply) => {
        return superAdminController.delete(request, reply);
    });
});

