import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifySensible from '@fastify/sensible';
import dotenv from 'dotenv';

dotenv.config();

export const registerConfig = fp(async (app) => {
    // Build allowed origins list
    const allowedOrigins = [];

    // Add ngrok URL
    allowedOrigins.push('https://d5c0cc2918fe.ngrok-free.app');

    // Add TENANT_UI_ORIGIN if set
    if (process.env.TENANT_UI_ORIGIN) {
        const origins = Array.isArray(process.env.TENANT_UI_ORIGIN)
            ? process.env.TENANT_UI_ORIGIN
            : process.env.TENANT_UI_ORIGIN.split(',').map(o => o.trim());
        allowedOrigins.push(...origins);
    }

    // In non-production, also allow common localhost ports (vite/react)
    if (process.env.NODE_ENV !== 'production') {
        allowedOrigins.push(
            'http://localhost:5175',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5174'
        );
    }

    await app.register(fastifyCors, {
        origin: allowedOrigins.length > 0 ? allowedOrigins : false,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token', 'x-request-id']
    });

    await app.register(fastifyHelmet, {
        global: true
    });

    await app.register(fastifySensible);

    await app.register(fastifyRateLimit, {
        max: 200,
        timeWindow: '1 minute'
    });

    const accessTokenTtl = process.env.JWT_ACCESS_TTL || '15m';
    const refreshTokenTtl = process.env.JWT_REFRESH_TTL || '7d';
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'tenant-access-secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'tenant-refresh-secret';

    await app.register(fastifyJwt, {
        secret: accessSecret,
        sign: {
            expiresIn: accessTokenTtl
        }
    });

    app.decorate('jwtConfig', Object.freeze({
        accessSecret,
        refreshSecret,
        accessTtl: accessTokenTtl,
        refreshTtl: refreshTokenTtl
    }));

    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Security Guard Management System API',
                version: '0.1.0',
                description: 'API for Security Guard Management System'
            },
            tags: [
                { name: 'System', description: 'Health checks and operational endpoints' },
                { name: 'Authentication', description: 'Tenant authentication and sessions' },
                { name: 'Users', description: 'Manage hospital users and invites' },
                { name: 'Departments', description: 'Manage hospital departments' },
                { name: 'Roles', description: 'Manage roles and role assignment' },
                { name: 'Permissions', description: 'Manage permissions and role-permission mapping' },
                { name: 'Admin', description: 'Administrative operations for hospital tenant' }
            ],
            // Swagger-UI extension: group tags into sections
            'x-tagGroups': [
                { name: 'System', tags: ['System'] },
                { name: 'Access', tags: ['Authentication'] },
                { name: 'Organization', tags: ['Users', 'Departments', 'Roles', 'Permissions'] },
                { name: 'Administration', tags: ['Admin'] }
            ],
            servers: [
                {
                    url: `http://localhost:${process.env.PORT || 4002}`,
                    description: 'Development server'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'none',
            displayRequestDuration: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha'
        }
    });
});
