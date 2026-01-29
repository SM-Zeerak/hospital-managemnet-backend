import { registerOwnerUsersRoutes } from './routes.js';

export async function registerOwnerUsersModule(app) {
    registerOwnerUsersRoutes(app);
}
