import { registerAuthRoutes } from './routes.js';

export async function registerAuthModule(app) {
    registerAuthRoutes(app);
}
