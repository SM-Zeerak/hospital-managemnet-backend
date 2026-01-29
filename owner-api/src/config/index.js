import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const baseDir = process.cwd();
const logDir = path.join(baseDir, 'src', 'log');

function logConfig(message) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(
            path.join(logDir, `${env}.log`),
            `[${new Date().toISOString()}] ${message}\n`
        );
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to write config log', error);
    }
}

export const registerConfig = fp(async (app) => {
    try {
        const accessTokenTtl = process.env.JWT_ACCESS_TTL || '15m';
        const refreshTokenTtl = process.env.JWT_REFRESH_TTL || '30d';
        const accessSecret = process.env.JWT_ACCESS_SECRET || 'owner-secret';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'owner-refresh-secret';

        const allowedOrigins = [];
        if (process.env.OWNER_UI_ORIGIN) {
            allowedOrigins.push(process.env.OWNER_UI_ORIGIN);
        }
        if (env === 'development') {
            allowedOrigins.push('http://localhost:5175', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5175', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000');
        }

        await app.register(fastifyCors, {
            origin: allowedOrigins.length > 0 ? allowedOrigins : true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'x-refresh-token', 'X-Refresh-Token']
        });

        await app.register(fastifyHelmet, {
            global: true
        });

        await app.register(fastifySensible);

        await app.register(fastifyRateLimit, {
            max: 100,
            timeWindow: '1 minute'
        });

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
                    title: 'Freight CRM Owner API',
                    version: '0.1.0',
                    description: 'Owner API for provisioning and managing tenant hospitals'
                },
                tags: [
                    { name: 'System', description: 'Health checks and operational endpoints' },
                    { name: 'Authentication', description: 'Owner authentication and session management' },
                    { name: 'Owner Users', description: 'Manage owner users' },
                    { name: 'Tenants', description: 'Manage tenant hospitals' },
                    { name: 'Plans', description: 'Plans and pricing management' },
                    { name: 'Subscriptions', description: 'Tenant subscription lifecycle' },
                    { name: 'Features', description: 'Feature flags and tenant feature access' },
                    { name: 'Templates', description: 'Templates and exports' },
                    { name: 'VPS Nodes', description: 'VPS nodes inventory and status' },
                    { name: 'Provisioning', description: 'Provisioning and sync operations' },
                    { name: 'Audit', description: 'Audit logs and activity tracking' }
                ],
                // Swagger-UI extension: group tags into sections
                'x-tagGroups': [
                    { name: 'System', tags: ['System'] },
                    { name: 'Owner', tags: ['Authentication', 'Owner Users'] },
                    { name: 'Tenants', tags: ['Tenants', 'Plans', 'Subscriptions', 'Features'] },
                    { name: 'Infrastructure', tags: ['Templates', 'VPS Nodes', 'Provisioning', 'Audit'] }
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
    } catch (error) {
        logConfig(`Config registration error: ${error.stack || error.message}`);
        throw error;
    }
});
