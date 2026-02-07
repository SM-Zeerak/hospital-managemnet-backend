import fp from 'fastify-plugin';
import { registerPermissionRoutes } from './routes.js';

export const registerPermissionsModule = fp(async (app) => {
    registerPermissionRoutes(app);
});
