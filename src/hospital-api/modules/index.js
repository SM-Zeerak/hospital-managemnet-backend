import fp from 'fastify-plugin';
import { registerStaffAuthModule } from './staff-auth/index.js';
import { registerStaffModule } from './staff/index.js';
import { registerPermissionMiddleware } from '../core/permissions.js';

export const registerHospitalRoutes = fp(async (app) => {
    // Register permission middleware
    await app.register(registerPermissionMiddleware);
    
    // Register modules
    await app.register(registerStaffAuthModule);
    await app.register(registerStaffModule);
});

