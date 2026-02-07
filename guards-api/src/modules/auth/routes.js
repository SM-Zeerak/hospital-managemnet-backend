import {
    createLoginController,
    createRefreshController,
    createLogoutController,
    createRequestResetController,
    createResendResetController,
    createResetPasswordController,
    createRequestEmailVerificationController,
    createResendEmailVerificationController,
    createVerifyEmailController
} from './controller.js';

export function registerAuthRoutes(app) {
    app.log.info({ module: 'tenant-auth' }, 'Registering tenant auth routes');

    const loginController = createLoginController(app);
    const refreshController = createRefreshController(app);
    const logoutController = createLogoutController(app);
    const requestResetController = createRequestResetController(app);
    const resendResetController = createResendResetController(app);
    const resetPasswordController = createResetPasswordController(app);
    const requestEmailVerificationController = createRequestEmailVerificationController(app);
    const resendEmailVerificationController = createResendEmailVerificationController(app);
    const verifyEmailController = createVerifyEmailController(app);

    app.post('/tenant/auth/login', {
        schema: {
            tags: ['Authentication'],
            summary: 'Login',
            description: 'Authenticate user and get access token',
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            additionalProperties: true,
                            properties: {
                                accessToken: { type: 'string' },
                                refreshToken: { type: 'string' },
                                accessIssuedAt: { type: 'string', format: 'date-time', nullable: true },
                                accessExpiresAt: { type: 'string', format: 'date-time', nullable: true },
                                refreshIssuedAt: { type: 'string', format: 'date-time', nullable: true },
                                refreshExpiresAt: { type: 'string', format: 'date-time', nullable: true },
                                user: {
                                    type: 'object',
                                    additionalProperties: true,
                                    nullable: true
                                }
                            }
                        }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Login',
                        responseTime: 12,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Login successful',
                        data: {
                            accessToken: 'eyJhbGciOi...',
                            refreshToken: 'eyJhbGciOi...',
                            accessIssuedAt: '2026-01-01T00:00:00.000Z',
                            accessExpiresAt: '2026-01-01T00:15:00.000Z',
                            refreshIssuedAt: '2026-01-01T00:00:00.000Z',
                            refreshExpiresAt: '2026-01-08T00:00:00.000Z',
                            user: {
                                id: '00000000-0000-0000-0000-000000000000',
                                email: 'admin@hospital.com',
                                firstName: 'Admin',
                                lastName: 'User',
                                roles: ['admin'],
                                permissions: []
                            }
                        }
                    }
                }
            }
        }
    }, loginController);

    app.post('/tenant/auth/refresh', {
        schema: {
            tags: ['Authentication'],
            summary: 'Refresh token',
            description: 'Refresh access token using refresh token',
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                    refreshToken: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Refresh Token',
                        responseTime: 9,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Token refreshed successfully',
                        data: {
                            accessToken: 'eyJhbGciOi...',
                            refreshToken: 'eyJhbGciOi...',
                            refreshExpiresAt: '2026-02-01T00:00:00.000Z',
                            refreshIssuedAt: '2026-01-01T00:00:00.000Z'
                        }
                    }
                }
            }
        }
    }, refreshController);

    app.post('/tenant/auth/logout', {
        schema: {
            tags: ['Authentication'],
            summary: 'Logout',
            description: 'Logout user and invalidate session',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    refreshToken: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Logout',
                        responseTime: 4,
                        timestamp: '2026-01-01T00:00:00.000Z'
                    }
                }
            }
        }
    }, logoutController);

    app.post('/tenant/auth/request-reset', {
        schema: {
            tags: ['Authentication'],
            summary: 'Request password reset',
            description: 'Request a password reset email',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Request Password Reset',
                        responseTime: 8,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'If that account exists, password reset instructions have been sent.',
                        data: {}
                    }
                }
            }
        }
    }, requestResetController);

    app.post('/tenant/auth/request-reset/resend', {
        schema: {
            tags: ['Authentication'],
            summary: 'Resend password reset',
            description: 'Resend password reset email',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Resend Password Reset',
                        responseTime: 7,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'If that account exists, password reset instructions have been sent.',
                        data: {}
                    }
                }
            }
        }
    }, resendResetController);

    app.post('/tenant/auth/reset', {
        schema: {
            tags: ['Authentication'],
            summary: 'Reset password',
            description: 'Reset password using reset token',
            body: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                    token: { type: 'string' },
                    password: { type: 'string', minLength: 8 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Reset Password',
                        responseTime: 9,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Password reset successfully'
                    }
                }
            }
        }
    }, resetPasswordController);

    app.post('/tenant/auth/verify-email/request', {
        schema: {
            tags: ['Authentication'],
            summary: 'Request email verification',
            description: 'Request email verification email',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Request Email Verification',
                        responseTime: 8,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Verification code sent',
                        data: {}
                    }
                }
            }
        }
    }, requestEmailVerificationController);

    app.post('/tenant/auth/verify-email/resend', {
        schema: {
            tags: ['Authentication'],
            summary: 'Resend email verification',
            description: 'Resend email verification email',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Resend Email Verification',
                        responseTime: 7,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Verification code resent',
                        data: {}
                    }
                }
            }
        }
    }, resendEmailVerificationController);

    app.post('/tenant/auth/verify-email', {
        schema: {
            tags: ['Authentication'],
            summary: 'Verify email',
            description: 'Verify email using verification token',
            body: {
                type: 'object',
                required: ['token'],
                properties: {
                    token: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        invokedMethod: { type: 'string' },
                        responseTime: { type: 'number' },
                        timestamp: { type: 'string' },
                        message: { type: 'string' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Verify Email',
                        responseTime: 6,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Email verified successfully'
                    }
                }
            }
        }
    }, verifyEmailController);

    app.log.info({ module: 'tenant-auth' }, 'Tenant auth routes registered');
}
