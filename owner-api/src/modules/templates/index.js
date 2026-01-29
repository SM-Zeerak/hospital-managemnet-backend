import { registerTemplateRoutes } from './routes.js';

export async function registerTemplatesModule(app) {
    registerTemplateRoutes(app);
}
