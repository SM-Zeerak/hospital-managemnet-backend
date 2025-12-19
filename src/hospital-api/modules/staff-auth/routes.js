import fp from 'fastify-plugin';
import { StaffAuthController } from './controller.js';
import { StaffAuthService } from './service.js';
import {
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from './schemas.js';

export const registerStaffAuthModule = fp(async (app) => {
    const staffAuthService = new StaffAuthService(app.db, app.jwtConfig);
    const staffAuthController = new StaffAuthController(staffAuthService);

    // Login
    app.post('/staff-auth/login', {
        schema: loginSchema,
        preHandler: [app.validateBody(loginSchema.shape.body)]
    }, async (request, reply) => {
        return staffAuthController.login(request, reply);
    });

    // Refresh token
    app.post('/staff-auth/refresh', {
        schema: refreshTokenSchema,
        preHandler: [app.validateBody(refreshTokenSchema.shape.body)]
    }, async (request, reply) => {
        return staffAuthController.refreshToken(request, reply);
    });

    // Forgot password
    app.post('/staff-auth/forgot-password', {
        schema: forgotPasswordSchema,
        preHandler: [app.validateBody(forgotPasswordSchema.shape.body)]
    }, async (request, reply) => {
        return staffAuthController.forgotPassword(request, reply);
    });

    // Reset password
    app.post('/staff-auth/reset-password', {
        schema: resetPasswordSchema,
        preHandler: [app.validateBody(resetPasswordSchema.shape.body)]
    }, async (request, reply) => {
        return staffAuthController.resetPassword(request, reply);
    });

    // Change password (requires authentication)
    app.post('/staff-auth/change-password', {
        schema: changePasswordSchema,
        preHandler: [
            app.authGuard,
            app.validateBody(changePasswordSchema.shape.body)
        ]
    }, async (request, reply) => {
        return staffAuthController.changePassword(request, reply);
    });

    // Logout (requires authentication)
    app.post('/staff-auth/logout', {
        preHandler: [app.authGuard]
    }, async (request, reply) => {
        return staffAuthController.logout(request, reply);
    });

    // Get current user profile
    app.get('/staff-auth/me', {
        preHandler: [app.authGuard]
    }, async (request, reply) => {
        return staffAuthController.getProfile(request, reply);
    });
});

