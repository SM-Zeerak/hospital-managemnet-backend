import { registerPlanRoutes } from './routes.js';

export async function registerPlanModule(app) {
    registerPlanRoutes(app);
}
