import fp from 'fastify-plugin';
import { v4 as uuid } from 'uuid';
import { normalizeError } from '../common/error-handler.js';

export const registerCore = fp(async (app) => {
    app.removeContentTypeParser('application/json');
    app.removeContentTypeParser('application/json; charset=utf-8');
    app.addContentTypeParser(/^application\/json($|;)/, { parseAs: 'string' }, (request, body, done) => {
        if (!body || body.length === 0) {
            done(null, {});
            return;
        }

        try {
            const parsed = JSON.parse(body);
            done(null, parsed);
        } catch (error) {
            error.statusCode = 400;
            done(error, undefined);
        }
    });

    app.addHook('onRequest', async (request) => {
        const id = request.headers['x-request-id'] || uuid();
        request.id = id;
    });

    app.decorate('authGuard', async (request) => {
        try {
            await request.jwtVerify();
        } catch (error) {
            throw app.httpErrors.unauthorized('Invalid authentication token');
        }
    });

    app.decorate('roleGuard', (roles) => async (request) => {
        await app.authGuard(request);
        const roleSet = new Set(request.user?.roles || []);
        const allowed = roles.some((role) => roleSet.has(role));
        if (!allowed) {
            throw app.httpErrors.forbidden('Insufficient role permissions');
        }
    });

    app.decorate('permissionGuard', (permission) => async (request) => {
        await app.authGuard(request);
        const permissions = request.user?.permissions || [];
        if (!permissions.includes(permission)) {
            throw app.httpErrors.forbidden('Missing required permission');
        }
    });

    app.decorate('departmentGuard', (department) => async (request) => {
        await app.authGuard(request);
        if (request.user?.department !== department) {
            throw app.httpErrors.forbidden('Department access restricted');
        }
    });

    app.setErrorHandler((error, request, reply) => {
        request.log.error({ err: error, requestId: request.id }, 'Request failed');

        const isProduction = process.env.NODE_ENV === 'production';
        const isServerError = (error.statusCode || 500) >= 500;
        
        // Use comprehensive error handler
        const normalized = normalizeError(error, request, isProduction);
        
        // Only show stack trace in development for server errors
        const details = normalized.details || 
            (!isProduction && isServerError && normalized.status >= 500 
                ? { stack: error.stack } 
                : undefined);

        const response = {
            ok: false,
            status: normalized.status,
            invokedMethod: request.routeOptions?.method || request.method || 'Unknown',
            responseTime: request.responseTime || 0,
            timestamp: new Date().toISOString(),
            error: {
                code: normalized.code,
                message: normalized.message,
                details,
                requestId: request.id
            }
        };

        reply.status(normalized.status).send(response);
    });
});
