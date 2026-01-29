import {
    createListTenantsController,
    createCreateTenantController,
    createGetTenantController,
    createUpdateTenantController,
    createNotifyTenantSyncController,
    createCheckTenantDatabaseHealthController,
    createListTenantUsersController,
    createCreateTenantUserController
} from './controller.js';

export function registerTenantRoutes(app) {
    const listController = createListTenantsController(app);
    const createController = createCreateTenantController(app);
    const getController = createGetTenantController(app);
    const updateController = createUpdateTenantController(app);
    const notifySyncController = createNotifyTenantSyncController(app);
    const healthCheckController = createCheckTenantDatabaseHealthController(app);
    const listTenantUsersController = createListTenantUsersController(app);
    const createTenantUserController = createCreateTenantUserController(app);

    const authGuard = app.authGuard;
    const allowAdmins = app.roleGuard(['super-admin', 'admin']);
    const allowSuperAdmin = app.roleGuard(['super-admin']);

    app.get('/owner/tenants', {
        schema: {
            tags: ['Tenants'],
            summary: 'List tenants',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowAdmins]
    }, listController);

    app.post('/owner/tenants', {
        schema: {
            tags: ['Tenants'],
            summary: 'Create tenant with first admin',
            description: 'Create a new tenant (hospital) and automatically create the first admin user',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['companyName', 'subdomain', 'tenantDbName'],
                properties: {
                    companyName: { type: 'string' },
                    subdomain: { type: 'string' },
                    tenantDbName: { type: 'string' },
                    tenantRegion: { type: 'string' },
                    planId: { type: 'string', format: 'uuid' },
                    syncWebhookUrl: { type: 'string', format: 'uri' },
                    firstAdmin: {
                        type: 'object',
                        description: 'Optional. If not provided, defaults to admin@tenantName.com / Admin1234',
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string', minLength: 8 },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' }
                        }
                    }
                }
            }
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, createController);

    app.get('/owner/tenants/:id', {
        schema: {
            tags: ['Tenants'],
            summary: 'Get tenant',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowAdmins]
    }, getController);

    app.patch('/owner/tenants/:id', {
        schema: {
            tags: ['Tenants'],
            summary: 'Update tenant',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, updateController);

    app.post('/owner/tenants/:id/notify-sync', {
        schema: {
            tags: ['Tenants'],
            summary: 'Notify tenant sync',
            description: 'Trigger tenant sync notification/webhook',
            security: [{ bearerAuth: [] }]
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, notifySyncController);

    app.get('/owner/tenants/:id/database-health', {
        schema: {
            tags: ['Tenants'],
            summary: 'Check tenant database health',
            description: 'Check the health status of both primary (local) and secondary (online) databases for a tenant. Primary is required for operations, secondary is optional for sync/backup.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                tenantId: { type: 'string', format: 'uuid' },
                                tenantName: { type: 'string' },
                                timestamp: { type: 'string', format: 'date-time' },
                                primary: {
                                    type: 'object',
                                    properties: {
                                        connected: { type: 'boolean' },
                                        error: { type: 'string', nullable: true },
                                        type: { type: 'string', enum: ['local'] }
                                    }
                                },
                                secondary: {
                                    type: 'object',
                                    properties: {
                                        connected: { type: 'boolean' },
                                        error: { type: 'string', nullable: true },
                                        configured: { type: 'boolean' },
                                        type: { type: 'string', enum: ['online'] }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        preHandler: [authGuard, allowAdmins]
    }, healthCheckController);

    // Tenant Users Management
    app.get('/owner/tenants/:id/users', {
        schema: {
            tags: ['Tenants'],
            summary: 'List tenant users',
            description: 'Get a list of all users for a specific tenant/hospital',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', default: 1 },
                    limit: { type: 'number', default: 20 },
                    search: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'suspended'] }
                }
            }
        },
        preHandler: [authGuard, allowAdmins]
    }, listTenantUsersController);

    app.post('/owner/tenants/:id/users', {
        schema: {
            tags: ['Tenants'],
            summary: 'Create tenant user',
            description: 'Create a new user for a specific tenant/hospital',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            body: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    departmentId: { type: 'string', format: 'uuid' },
                    roleIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
                }
            }
        },
        preHandler: [authGuard, allowSuperAdmin]
    }, createTenantUserController);
}
