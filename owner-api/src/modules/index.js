import { registerAuthModule } from './auth/index.js';
import { registerOwnerUsersModule } from './owner-users/index.js';
import { registerTenantModule } from './tenants/index.js';
import { registerPlanModule } from './plans/index.js';
import { registerSubscriptionsModule } from './subscriptions/index.js';
import { registerFeatureModule } from './features/index.js';
import { registerTemplatesModule } from './templates/index.js';
import { registerVpsNodesModule } from './vps-nodes/index.js';
import { registerProvisioningModule } from './provisioning/index.js';
import { registerAuditModule } from './audit/index.js';

export async function registerRoutes(app) {
    app.get(
        '/health',
        {
            schema: {
                tags: ['System'],
                summary: 'Health check',
                description: 'Service health check endpoint',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                            version: { type: 'string' },
                            environment: { type: 'string' },
                            timestamp: { type: 'string' },
                            uptime: { type: 'number' },
                            message: { type: 'string' }
                        },
                        example: {
                            ok: true,
                            version: '0.1.0',
                            environment: 'development',
                            timestamp: '2026-01-01T00:00:00.000Z',
                            uptime: 123.45,
                            message: 'Owner API is running'
                        }
                    }
                }
            }
        },
        async () => ({
            ok: true,
            version: '0.1.0',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            message: 'Owner API is running'
        })
    );

    const modules = [
        registerAuthModule,
        registerOwnerUsersModule,
        registerTenantModule,
        registerPlanModule,
        registerSubscriptionsModule,
        registerFeatureModule,
        registerTemplatesModule,
        registerVpsNodesModule,
        registerProvisioningModule,
        registerAuditModule
    ];
    await Promise.all(modules.map(module => app.register(module)));
}
