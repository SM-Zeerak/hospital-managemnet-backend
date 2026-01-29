import { registerProvisioningRoutes } from './routes.js';

export async function registerProvisioningModule(app) {
    registerProvisioningRoutes(app);
}
