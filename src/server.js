import 'dotenv/config';
import fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { registerConfig } from './superadmin-api/config/index.js';
import { registerCore } from './superadmin-api/core/index.js';
import { registerSuperadminRoutes } from './superadmin-api/modules/index.js';
import { initDatabase } from './database/index.js';
import { initSuperadminModels } from './superadmin-api/database/models/index.js';

const env = process.env.NODE_ENV || 'development';
const logDir = path.join(process.cwd(), 'logs');

function ensureLogDir() {
    try {
        fs.mkdirSync(logDir, { recursive: true });
    } catch (error) {
        console.error('Failed to ensure log directory', error);
    }
}

async function buildServer() {
    ensureLogDir();

    const transportTargets = [];

    if (env === 'development') {
        transportTargets.push({
            target: 'pino-pretty',
            options: {
                colorize: true,
                levelFirst: true,
                messageFormat: '{msg} {req_id} {tenantId} {userId}',
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        });
    }

    transportTargets.push({
        target: 'pino/file',
        options: {
            destination: path.join(logDir, `${env}.log`),
            mkdir: true
        }
    });

    const app = fastify({
        logger: {
            base: {
                'API': '@hospital-backend',
                'Version': '0.1.0',
                'Environment': env
            },
            transport: {
                targets: transportTargets
            }
        }
    });

    // Register config with security middleware
    try {
        await registerConfig(app);
    } catch (error) {
        console.error('registerConfig failed', error);
        throw error;
    }

    // Register audit logging
    try {
        const { auditMiddleware } = await import('./middleware/audit.js');
        await app.register(auditMiddleware);
    } catch (error) {
        console.error('auditMiddleware registration failed', error);
        // Don't throw - audit is optional but recommended
    }

    // Register core middleware (includes both superadmin and guard features)
    try {
        await registerCore(app);
    } catch (error) {
        console.error('registerCore failed', error);
        throw error;
    }

    let sequelize;
    try {
        sequelize = await initDatabase();
    } catch (error) {
        console.error('initDatabase failed', error);
        throw error;
    }

    // Initialize models
    const superadminModels = initSuperadminModels(sequelize);
    
    // Initialize hospital models
    let hospitalModels = {};
    try {
        const { initHospitalModels } = await import('./hospital-api/database/models/index.js');
        hospitalModels = initHospitalModels(sequelize);
    } catch (error) {
        app.log.warn('Hospital API models not found - skipping');
    }
    
    // Try to initialize guard models if guard-api exists
    let guardModels = {};
    try {
        const { initGuardModels } = await import('./guard-api/database/models/index.js');
        guardModels = initGuardModels(sequelize);
    } catch (error) {
        // Guard API not implemented yet - this is optional
        app.log.info('Guard API models not found - skipping');
    }
    
    app.decorate('db', {
        sequelize,
        models: {
            ...superadminModels,
            ...hospitalModels,
            ...guardModels
        }
    });

    // Root health check
    app.get('/', async (request, reply) => {
        return {
            ok: true,
            message: 'Hospital Backend API is running',
            version: '0.1.0',
            environment: env,
            timestamp: new Date().toISOString(),
            endpoints: {
                superadmin: '/api/v1/superadmin',
                hospital: '/api/v1/hospital',
                docs: '/docs'
            }
        };
    });

    app.get('/health', async (request, reply) => {
        return {
            ok: true,
            message: 'Hospital Backend API is healthy',
            version: '0.1.0',
            environment: env,
            timestamp: new Date().toISOString()
        };
    });

    try {
        // Register Superadmin API routes
        await app.register(registerSuperadminRoutes, { prefix: '/api/v1/superadmin' });
        
        // Register Hospital API routes
        try {
            const { registerHospitalRoutes } = await import('./hospital-api/modules/index.js');
            await app.register(registerHospitalRoutes, { prefix: '/api/v1/hospital' });
        } catch (error) {
            app.log.warn('Hospital API routes not found - skipping');
        }
        
        // Try to register Guard API routes if guard-api exists
        try {
            const { registerGuardRoutes } = await import('./guard-api/modules/index.js');
            await app.register(registerGuardRoutes, { prefix: '/api/v1/guard' });
        } catch (error) {
            // Guard API not implemented yet - this is optional
            app.log.info('Guard API routes not found - skipping');
        }
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

        const port = Number(process.env.PORT || 4000);
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });
        app.log.info(`Hospital Backend API running on http://${host}:${port}`);
        app.log.info(`Superadmin API: http://${host}:${port}/api/v1/superadmin`);
        app.log.info(`Hospital API: http://${host}:${port}/api/v1/hospital`);
        app.log.info(`API Docs: http://${host}:${port}/docs`);

        await app.ready();
        app.log.info({ routes: app.printRoutes() }, 'Registered routes');
    } catch (err) {
        ensureLogDir();
        const errorLogPath = path.join(logDir, 'startup-error.log');
        const message = err instanceof Error ? `${err.stack || err.message}` : String(err);

        try {
            fs.appendFileSync(errorLogPath, `[${new Date().toISOString()}] ${message}\n`);
        } catch (fileError) {
            console.error('Failed to write startup error log', fileError);
        }

        if (app?.log) {
            app.log.error(err, 'Hospital Backend API failed to start');
        } else {
            console.error('Hospital Backend API failed to start', err);
        }

        process.exit(1);
    }
}

process.on('unhandledRejection', (reason) => {
    ensureLogDir();
    const errorLogPath = path.join(logDir, 'unhandled.log');
    const message = reason instanceof Error ? reason.stack || reason.message : String(reason);
    try {
        fs.appendFileSync(errorLogPath, `[${new Date().toISOString()}] ${message}\n`);
    } catch (fileError) {
        console.error('Failed to write unhandled rejection log', fileError);
    }
    console.error('Unhandled rejection', reason);
});

process.on('uncaughtException', (error) => {
    ensureLogDir();
    const errorLogPath = path.join(logDir, 'uncaught.log');
    try {
        fs.appendFileSync(errorLogPath, `[${new Date().toISOString()}] ${error.stack || error.message}\n`);
    } catch (fileError) {
        console.error('Failed to write uncaught exception log', fileError);
    }
    console.error('Uncaught exception', error);
    process.exit(1);
});

process.on('exit', (code) => {
    ensureLogDir();
    const exitLogPath = path.join(logDir, 'exit.log');
    try {
        fs.appendFileSync(exitLogPath, `[${new Date().toISOString()}] Process exiting with code ${code}\n`);
    } catch (error) {
        console.error('Failed to write exit log', error);
    }
});

start().catch((error) => {
    console.error('Failed to start Hospital Backend API', error);
    process.exit(1);
});

export { buildServer, start };

