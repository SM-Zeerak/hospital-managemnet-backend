import fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerConfig } from './config/index.js';
import { registerCore } from './core/index.js';
import { registerRoutes } from './modules/index.js';
import { initDatabase } from './database/index.js';
import { registerMailer } from './services/mailer/index.js';
import { initModels } from './database/models/index.js';

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
                'API': '@dynamix-zone',
                'Version': '0.1.0',
                'Environment': env
            },
            transport: {
                targets: transportTargets
            }
        }
    });

    try {
        await registerConfig(app);
    } catch (error) {
        console.error('registerConfig failed', error);
        throw error;
    }

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

    const models = initModels(sequelize);
    app.decorate('db', {
        sequelize,
        models
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

        const port = Number(process.env.PORT || 4001);
        const host = process.env.HOST || '0.0.0.0';

        await app.listen({ port, host });
        app.log.info(`Owner API running on http://${host}:${port}`);

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
            app.log.error(err, 'Owner API failed to start');
        } else {
            
            console.error('Owner API failed to start', err);
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
    console.error('Failed to start Owner API', error);
    process.exit(1);
});

export { buildServer, start };
