import { registerFeatureRoutes } from './routes.js';

export async function registerFeatureModule(app) {
    registerFeatureRoutes(app);
}
