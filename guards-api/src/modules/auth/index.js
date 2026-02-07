import fp from 'fastify-plugin';
import { registerAuthRoutes } from './routes.js';

export const registerTenantAuth = fp(async (app) => {
    registerAuthRoutes(app);
});
