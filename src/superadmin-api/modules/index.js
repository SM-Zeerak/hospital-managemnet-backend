import fp from 'fastify-plugin';
import { registerAuthModule } from './auth/index.js';
import { registerSuperAdminsModule } from './super-admins/index.js';

export const registerSuperadminRoutes = fp(async (app) => {
    // Register modules
    await app.register(registerAuthModule);
    await app.register(registerSuperAdminsModule);
});

