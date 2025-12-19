import fp from 'fastify-plugin';
import fs from 'node:fs';
import path from 'node:path';

const auditLogDir = path.join(process.cwd(), 'logs', 'audit');

function ensureAuditLogDir() {
    try {
        fs.mkdirSync(auditLogDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create audit log directory', error);
    }
}

// Audit logging middleware
export const auditMiddleware = fp(async (app) => {
    ensureAuditLogDir();

    app.decorate('auditLog', (event, details) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            ...details
        };

        const logFile = path.join(auditLogDir, `${new Date().toISOString().split('T')[0]}.log`);
        
        try {
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.error('Failed to write audit log', error);
        }
    });

    // Log authentication events
    app.addHook('onRequest', async (request) => {
        // Log sensitive operations
        const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const sensitivePaths = ['/auth', '/users', '/admin', '/settings'];
        
        if (sensitiveMethods.includes(request.method) || 
            sensitivePaths.some(path => request.url.includes(path))) {
            request.auditContext = {
                method: request.method,
                url: request.url,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                timestamp: new Date().toISOString()
            };
        }
    });

    // Log after response
    app.addHook('onResponse', async (request, reply) => {
        if (request.auditContext) {
            app.auditLog('api_request', {
                ...request.auditContext,
                statusCode: reply.statusCode,
                userId: request.user?.id,
                tenantId: request.tenantId
            });
        }
    });
});

