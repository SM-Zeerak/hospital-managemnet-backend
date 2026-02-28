import { registerGuardRoutes } from './routes.js';

export async function registerGuardsModule(app) {
    registerGuardRoutes(app);
}
