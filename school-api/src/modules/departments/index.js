import fp from 'fastify-plugin';
import { registerDepartmentRoutes } from './routes.js';

export const registerDepartmentsModule = fp(async (app) => {
    registerDepartmentRoutes(app);
});
