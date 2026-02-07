import fastify from 'fastify';
import { registerConfig } from './config/index.js';
import { registerCore } from './core/index.js';
import { registerRoutes } from './modules/index.js';
import { initDatabase } from './database/index.js';
import { registerMailer } from './services/mailer/index.js';
import { initModels } from './database/models/index.js';

const env = process.env.NODE_ENV || 'development';

async function buildServer() {
    const app = fastify({
        logger: {
            base: {
                'API': '@hospital-management-tenant',
                'Version': '0.1.0',
                'Environment': env
            },
            transport: env === 'development' ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    levelFirst: true,
                    messageFormat: '{msg} {req_id} {tenantId} {userId}',
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            } : undefined
        }
    });

    try {
        await app.register(registerConfig);
    } catch (error) {
        console.error('registerConfig failed', error);
        throw error;
    }

    try {
        await app.register(registerCore);
    } catch (error) {
        console.error('registerCore failed', error);
        throw error;
    }

    let dbConnections;
    try {
        dbConnections = await initDatabase();
    } catch (error) {
        console.error('initDatabase failed', error);
        throw error;
    }

    // Use primary connection for models (required)
    const models = initModels(dbConnections.primary);
    app.decorate('db', {
        sequelize: dbConnections.primary,
        models,
        connections: dbConnections
    });

    try {
        await app.register(registerMailer);
    } catch (error) {
        app.log.error({ err: error }, 'registerMailer failed');
        throw error;
    }

    try {
        await app.register(registerRoutes, { prefix: '/api/v1' });
    } catch (error) {
        console.error('registerRoutes failed', error);
        throw error;
    }

    return app;
}

async function start() {
    let app;
    try {
        app = await buildServer();

        const port = Number(process.env.PORT || 4002);
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });
        app.log.info(`Tenant API running on http://${host}:${port}`);

        await app.ready();
        app.log.info({ routes: app.printRoutes() }, 'Registered routes');
    } catch (err) {
        if (app?.log) {
            app.log.error(err, 'Tenant API failed to start');
        } else {
            console.error('Tenant API failed to start', err);
        }
        process.exit(1);
    }
}

start().catch((error) => {
    console.error('Failed to start Tenant API', error);
    process.exit(1);
});

export { buildServer, start };
