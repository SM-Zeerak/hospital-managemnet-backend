import fp from 'fastify-plugin';
import { registerUserRoutes } from './routes.js';

export const registerUsersModule = fp(async (app) => {
    registerUserRoutes(app);
});
