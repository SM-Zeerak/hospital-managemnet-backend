import fp from 'fastify-plugin';
import { validatePermissions, getAllPermissions } from '../config/permissions.js';

/**
 * Permission middleware for hospital API
 * 
 * Usage:
 * app.get('/route', {
 *   preHandler: [
 *     app.authGuard,
 *     app.requirePermission('staff:create')
 *   ]
 * }, handler)
 */
export const registerPermissionMiddleware = fp(async (app) => {
    /**
     * Require a single permission
     */
    app.decorate('requirePermission', (permission) => {
        return async (request) => {
            await app.authGuard(request);
            
            // Super admins have all permissions
            if (request.user?.type === 'super-admin') {
                return;
            }

            // Check if user is staff
            if (request.user?.type !== 'staff') {
                throw app.httpErrors.forbidden('Staff access required');
            }

            const userPermissions = request.user?.permissions || [];
            
            if (!userPermissions.includes(permission)) {
                throw app.httpErrors.forbidden(`Permission required: ${permission}`);
            }
        };
    });

    /**
     * Require any of the given permissions
     */
    app.decorate('requireAnyPermission', (permissions) => {
        return async (request) => {
            await app.authGuard(request);
            
            // Super admins have all permissions
            if (request.user?.type === 'super-admin') {
                return;
            }

            // Check if user is staff
            if (request.user?.type !== 'staff') {
                throw app.httpErrors.forbidden('Staff access required');
            }

            const userPermissions = request.user?.permissions || [];
            const hasPermission = permissions.some(p => userPermissions.includes(p));
            
            if (!hasPermission) {
                throw app.httpErrors.forbidden(`One of these permissions required: ${permissions.join(', ')}`);
            }
        };
    });

    /**
     * Require all of the given permissions
     */
    app.decorate('requireAllPermissions', (permissions) => {
        return async (request) => {
            await app.authGuard(request);
            
            // Super admins have all permissions
            if (request.user?.type === 'super-admin') {
                return;
            }

            // Check if user is staff
            if (request.user?.type !== 'staff') {
                throw app.httpErrors.forbidden('Staff access required');
            }

            const userPermissions = request.user?.permissions || [];
            const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
            
            if (!hasAllPermissions) {
                throw app.httpErrors.forbidden(`All of these permissions required: ${permissions.join(', ')}`);
            }
        };
    });

    /**
     * Get all available permissions (for admin UI)
     * This endpoint is public - no authentication required
     */
    app.get('/permissions', async (request, reply) => {
        return {
            ok: true,
            data: {
                permissions: getAllPermissions(),
                modules: {
                    staff: ['create', 'view', 'update', 'delete', 'list'],
                    patient: ['create', 'view', 'update', 'delete', 'list'],
                    appointment: ['create', 'view', 'update', 'delete', 'list', 'cancel'],
                    medical_record: ['create', 'view', 'update', 'delete', 'list'],
                    prescription: ['create', 'view', 'update', 'delete', 'list'],
                    lab_test: ['create', 'view', 'update', 'delete', 'list'],
                    billing: ['create', 'view', 'update', 'delete', 'list', 'payment'],
                    inventory: ['create', 'view', 'update', 'delete', 'list'],
                    reports: ['view', 'export', 'analytics'],
                    settings: ['view', 'update']
                }
            }
        };
    });
});

