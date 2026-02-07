import {
    createGetUserStatsController,
    createListUsersController,
    createGetUserController,
    createCreateUserController,
    createUpdateUserController,
    createActivateUserController,
    createSuspendUserController,
    createDeleteUserController,
    createBulkOperationController,
    createCreateInviteController,
    createListInvitesController,
    createResendInviteController,
    createCancelInviteController,
    createAcceptInviteController
} from './controller.js';

export function registerUserRoutes(app) {
    const authGuard = app.authGuard;
    const requireRead = app.permissionGuard('users.read');
    const requireCreate = app.permissionGuard('users.create');
    const requireUpdate = app.permissionGuard('users.update');
    const requireDelete = app.permissionGuard('users.delete');
    const requireAdmin = app.roleGuard(['admin']);
    const requireAdminOrSubAdmin = app.roleGuard(['admin', 'sub-admin']);

    // User Statistics
    app.get('/tenant/users/stats', {
        schema: {
            tags: ['Users'],
            summary: 'Get user statistics',
            description: 'Get statistics about users in the hospital',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        active: { type: 'number' },
                        suspended: { type: 'number' }
                    }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createGetUserStatsController(app));

    // User CRUD
    app.get('/tenant/users', {
        schema: {
            tags: ['Users'],
            summary: 'List users',
            description: 'Get a list of all users with pagination and filtering',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                additionalProperties: true,
                properties: {
                    search: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'suspended'] },
                    departmentId: { type: 'string', format: 'uuid' },
                    roleId: { type: 'string', format: 'uuid' },
                    limit: { type: 'string', pattern: '^\\d+$' },
                    offset: { type: 'string', pattern: '^\\d+$' },
                    orderBy: { type: 'string' },
                    orderDir: { type: 'string', enum: ['ASC', 'DESC'] },
                    dateFrom: { type: 'string', format: 'date-time' },
                    dateTo: { type: 'string', format: 'date-time' }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createListUsersController(app));

    app.post('/tenant/users', {
        schema: {
            tags: ['Users'],
            summary: 'Create user',
            description: 'Create a new user in the hospital',
            security: [{ bearerAuth: [] }],
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
        preHandler: [authGuard, requireAdminOrSubAdmin, requireCreate]
    }, createCreateUserController(app));

    app.get('/tenant/users/:id', {
        schema: {
            tags: ['Users'],
            summary: 'Get user by ID',
            description: 'Get details of a specific user',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createGetUserController(app));

    app.patch('/tenant/users/:id', {
        schema: {
            tags: ['Users'],
            summary: 'Update user',
            description: 'Update user information',
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
                properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    departmentId: { type: 'string', format: 'uuid' },
                    roleIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                    status: { type: 'string', enum: ['active', 'suspended'] }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, createUpdateUserController(app));

    app.post('/tenant/users/:id/activate', {
        schema: {
            tags: ['Users'],
            summary: 'Activate user',
            description: 'Activate a suspended user',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdminOrSubAdmin, requireUpdate]
    }, createActivateUserController(app));

    app.post('/tenant/users/:id/suspend', {
        schema: {
            tags: ['Users'],
            summary: 'Suspend user',
            description: 'Suspend an active user',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdminOrSubAdmin, requireUpdate]
    }, createSuspendUserController(app));

    app.delete('/tenant/users/:id', {
        schema: {
            tags: ['Users'],
            summary: 'Delete user',
            description: 'Delete a user from the system',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdmin, requireDelete]
    }, createDeleteUserController(app));

    // Bulk Operations
    app.post('/tenant/users/bulk', {
        schema: {
            tags: ['Users'],
            summary: 'Bulk user operations',
            description: 'Perform bulk operations on multiple users',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['userIds', 'action'],
                properties: {
                    userIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                    action: { type: 'string', enum: ['activate', 'suspend', 'delete'] }
                }
            }
        },
        preHandler: [authGuard, requireAdminOrSubAdmin, requireUpdate]
    }, createBulkOperationController(app));

    // User Invites
    app.post('/tenant/users/invites', {
        schema: {
            tags: ['Users'],
            summary: 'Create user invite',
            description: 'Create an invitation for a new user',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['email', 'firstName', 'lastName'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    departmentId: { type: 'string', format: 'uuid' },
                    roleIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
                }
            }
        },
        preHandler: [authGuard, requireAdminOrSubAdmin, requireCreate]
    }, createCreateInviteController(app));

    app.get('/tenant/users/invites', {
        schema: {
            tags: ['Users'],
            summary: 'List user invites',
            description: 'Get a list of all user invitations',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['pending', 'accepted', 'cancelled'] },
                    search: { type: 'string' },
                    limit: { type: 'number', default: 50 },
                    offset: { type: 'number', default: 0 }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createListInvitesController(app));

    app.post('/tenant/users/invites/:inviteId/resend', {
        schema: {
            tags: ['Users'],
            summary: 'Resend user invite',
            description: 'Resend an invitation email',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['inviteId'],
                properties: {
                    inviteId: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdminOrSubAdmin, requireCreate]
    }, createResendInviteController(app));

    app.post('/tenant/users/invites/:inviteId/cancel', {
        schema: {
            tags: ['Users'],
            summary: 'Cancel user invite',
            description: 'Cancel a pending invitation',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['inviteId'],
                properties: {
                    inviteId: { type: 'string', format: 'uuid' }
                }
            }
        },
        preHandler: [authGuard, requireAdminOrSubAdmin, requireUpdate]
    }, createCancelInviteController(app));

    // Public endpoint for accepting invites (no auth required)
    app.post('/tenant/users/invites/accept', {
        schema: {
            tags: ['Users'],
            summary: 'Accept user invite',
            description: 'Accept a user invitation and set password',
            body: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                    token: { type: 'string', format: 'uuid' },
                    password: { type: 'string', minLength: 8 }
                }
            }
        }
    }, createAcceptInviteController(app));
}
