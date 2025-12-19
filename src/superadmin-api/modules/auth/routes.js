import fp from 'fastify-plugin';
import { AuthController } from './controller.js';
import { AuthService } from './service.js';
import { loginSchema, refreshTokenSchema } from './schemas.js';

export const registerAuthModule = fp(async (app) => {
    const authService = new AuthService(app.db, app.jwtConfig);
    const authController = new AuthController(authService);

    // Login
    app.post('/auth/login', {
        schema: loginSchema,
        preHandler: [app.validateBody(loginSchema.shape.body)]
    }, async (request, reply) => {
        return authController.login(request, reply);
    });

    // Refresh token
    app.post('/auth/refresh', {
        schema: refreshTokenSchema,
        preHandler: [app.validateBody(refreshTokenSchema.shape.body)]
    }, async (request, reply) => {
        return authController.refreshToken(request, reply);
    });

    // Logout (requires authentication)
    app.post('/auth/logout', {
        preHandler: [app.authGuard]
    }, async (request, reply) => {
        return authController.logout(request, reply);
    });

    // Get current user profile
    app.get('/auth/me', {
        preHandler: [app.authGuard]
    }, async (request, reply) => {
        return authController.getProfile(request, reply);
    });
});

