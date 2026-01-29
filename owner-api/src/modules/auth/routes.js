import {
    createLoginController,
    createRefreshController,
    createLogoutController,
    createRequestResetController,
    createResendResetController,
    createResetPasswordController
} from './controller.js';

export function registerAuthRoutes(app) {
    app.log.info({ module: 'owner-auth' }, 'Registering owner auth routes');

    const loginController = createLoginController(app);
    const refreshController = createRefreshController(app);
    const logoutController = createLogoutController(app);
    const requestResetController = createRequestResetController(app);
    const resendResetController = createResendResetController(app);
    const resetPasswordController = createResetPasswordController(app);

    app.post('/owner/auth/login', {
        schema: {
            tags: ['Authentication'],
            summary: 'Login',
            description: 'Authenticate an owner user and get access/refresh tokens',
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
                        data: { type: 'object' }
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
                            refreshExpiresAt: '2026-02-01T00:00:00.000Z',
                            refreshIssuedAt: '2026-01-01T00:00:00.000Z',
                            user: {
                                id: '00000000-0000-0000-0000-000000000000',
                                email: 'admin@example.com',
                                role: 'super-admin'
                            }
                        }
                    }
                }
            }
        }
    }, loginController);

    app.post('/owner/auth/refresh', {
        schema: {
            tags: ['Authentication'],
            summary: 'Refresh token',
            description: 'Refresh access token using a refresh token',
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
                        data: { type: 'object' },
                        meta: { type: 'object' }
                    },
                    example: {
                        ok: true,
                        status: 200,
                        invokedMethod: 'Refresh Token',
                        responseTime: 10,
                        timestamp: '2026-01-01T00:00:00.000Z',
                        message: 'Token refreshed successfully',
                        data: {
                            accessToken: 'eyJhbGciOi...',
                            refreshToken: 'eyJhbGciOi...',
                            refreshExpiresAt: '2026-02-01T00:00:00.000Z',
                            refreshIssuedAt: '2026-01-01T00:00:00.000Z',
                            user: {
                                id: '00000000-0000-0000-0000-000000000000',
                                email: 'admin@example.com',
                                role: 'super-admin'
                            }
                        }
                    }
                }
            }
        }
    }, refreshController);

    app.post('/owner/auth/logout', {
        schema: {
            tags: ['Authentication'],
            summary: 'Logout',
            description: 'Invalidate refresh token / session',
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

    app.post('/owner/auth/request-reset', {
        schema: {
            tags: ['Authentication'],
            summary: 'Request password reset',
            description: 'Request a password reset email/OTP for an owner user',
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

    app.post('/owner/auth/request-reset/resend', {
        schema: {
            tags: ['Authentication'],
            summary: 'Resend password reset',
            description: 'Resend password reset OTP/email for an owner user',
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

    app.post('/owner/auth/reset', {
        schema: {
            tags: ['Authentication'],
            summary: 'Reset password',
            description: 'Reset password using reset token and OTP',
            body: {
                type: 'object',
                required: ['token', 'password', 'otp'],
                properties: {
                    token: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                    otp: { type: 'string' }
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

    app.log.info({ module: 'owner-auth' }, 'Owner auth routes registered');
}
