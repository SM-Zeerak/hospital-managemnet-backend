import { registerBedRoutes } from './routes.js';

export async function registerBedsModule(app) {
    registerBedRoutes(app);
}
