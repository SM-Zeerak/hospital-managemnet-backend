import fp from 'fastify-plugin';
import { registerAdminRoutes } from './routes.js';

export const registerAdminModule = fp(async (app) => {
    registerAdminRoutes(app);
});


