import { registerVpsNodeRoutes } from './routes.js';

export async function registerVpsNodesModule(app) {
    registerVpsNodeRoutes(app);
}
