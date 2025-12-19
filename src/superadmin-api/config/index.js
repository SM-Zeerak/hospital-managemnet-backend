import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { getCorsConfig, rateLimitConfig, helmetConfig, securityMiddleware } from '../../middleware/security.js';
import { validationMiddleware } from '../../middleware/validation.js';

const env = process.env.NODE_ENV || 'development';

// Validate required environment variables
function validateEnv() {
    const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'PG_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate JWT secrets strength
    if (process.env.JWT_ACCESS_SECRET.length < 32) {
        throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long');
    }
    if (process.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }
}

export const registerConfig = fp(async (app) => {
    try {
        // Validate environment variables
        validateEnv();

        const accessTokenTtl = process.env.JWT_ACCESS_TTL || '15m';
        const refreshTokenTtl = process.env.JWT_REFRESH_TTL || '30d';
        const accessSecret = process.env.JWT_ACCESS_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;

        // Register security middleware first
        await app.register(securityMiddleware);
        await app.register(validationMiddleware);

        // CORS with secure configuration
        await app.register(fastifyCors, getCorsConfig(env));

        // Helmet with enhanced security headers
        await app.register(fastifyHelmet, helmetConfig);

        await app.register(fastifySensible);

        // Enhanced rate limiting
        await app.register(fastifyRateLimit, rateLimitConfig);

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
                    title: 'Guard Management Superadmin API',
                    version: '0.1.0'
                }
            }
        });

        await app.register(fastifySwaggerUi, {
            routePrefix: '/docs'
        });
    } catch (error) {
        console.error(`Config registration error: ${error.stack || error.message}`);
        throw error;
    }
});

