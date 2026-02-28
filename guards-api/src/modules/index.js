import { registerTenantAuth } from './auth/index.js';
import { registerUsersModule } from './users/index.js';
import { registerDepartmentsModule } from './departments/index.js';
import { registerRolesModule } from './roles/index.js';
import { registerPermissionsModule } from './permissions/index.js';
import { registerGuardsModule } from './guards/index.js';
import { registerUploadModule } from './upload/index.js';
import { registerAdminModule } from './admin/index.js';

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
                            message: 'Security Guard Management System API is running'
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
            message: 'Security Guard Management System API is running'
        })
    );

    const modules = [
        registerTenantAuth,
        registerUsersModule,
        registerDepartmentsModule,
        registerRolesModule,
        registerPermissionsModule,
        registerGuardsModule,
        registerUploadModule,
        registerAdminModule,
    ];
    for (const module of modules) {
        await app.register(module);
    }
}
