import fp from 'fastify-plugin';
import { v4 as uuid } from 'uuid';

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
        
        // Extract tenant ID from header if present (for guard-api)
        const tenantId = request.headers['x-tenant-id'];
        if (tenantId) {
            request.tenantId = tenantId;
        }
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
        const userRole = request.user?.role;
        if (!roles.includes(userRole)) {
            throw app.httpErrors.forbidden('Insufficient role permissions');
        }
    });

    app.decorate('allowSuperAdmin', async (request) => {
        await app.authGuard(request);
        if (request.user?.role !== 'super-admin') {
            throw app.httpErrors.forbidden('Only super-admins can perform this action');
        }
    });

    // Add tenantGuard for guard-api compatibility
    app.decorate('tenantGuard', async (request) => {
        await app.authGuard(request);
        const tenantId = request.tenantId || request.user?.tenantId;
        if (!tenantId) {
            throw app.httpErrors.badRequest('Tenant ID is required');
        }
        request.tenantId = tenantId;
    });

    app.setErrorHandler((error, request, reply) => {
        request.log.error({ err: error, requestId: request.id }, 'Request failed');

        const status = error.statusCode || 500;
        const isServerError = status >= 500;
        const isProduction = process.env.NODE_ENV === 'production';
        const message = isServerError
            ? (isProduction ? 'Internal server error' : error.message || 'Internal server error')
            : error.message;

        const response = {
            ok: false,
            error: {
                code: error.code || error.name || (isServerError ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
                message,
                details: error.details || (!isProduction && isServerError ? { stack: error.stack } : undefined),
                requestId: request.id
            }
        };

        reply.status(status).send(response);
    });
});

