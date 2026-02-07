import fp from 'fastify-plugin';
import routes from './routes.js';

export const registerDriversModule = fp(async (app) => {
    app.register(routes, { prefix: '/tour/drivers' });
});
