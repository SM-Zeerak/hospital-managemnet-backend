import { registerTenantRoutes } from './routes.js';

export async function registerTenantModule(app) {
    registerTenantRoutes(app);
}
