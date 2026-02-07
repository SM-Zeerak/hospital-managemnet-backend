import fp from 'fastify-plugin';
import { registerRoleRoutes } from './routes.js';

export const registerRolesModule = fp(async (app) => {
    registerRoleRoutes(app);
});
