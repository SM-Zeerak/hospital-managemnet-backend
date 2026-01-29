import { registerSubscriptionRoutes } from './routes.js';

export async function registerSubscriptionsModule(app) {
    registerSubscriptionRoutes(app);
}
