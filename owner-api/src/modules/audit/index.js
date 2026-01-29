import { registerAuditRoutes } from './routes.js';

export async function registerAuditModule(app) {
    registerAuditRoutes(app);
}
