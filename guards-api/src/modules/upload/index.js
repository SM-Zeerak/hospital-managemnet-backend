import { registerUploadRoutes } from './routes.js';

export async function registerUploadModule(app) {
    await registerUploadRoutes(app);
}
