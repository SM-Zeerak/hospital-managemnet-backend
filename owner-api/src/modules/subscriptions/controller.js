import { upsertSubscriptionSchema } from './schemas.js';
import { getSubscription, upsertSubscription } from './service.js';

export function createGetSubscriptionController(app) {
    return async function getSubscriptionController(request) {
        await app.authGuard(request);
        const { tenantId } = request.params;
        const subscription = await getSubscription(app.db.models, tenantId);
        if (!subscription) {
            throw app.httpErrors.notFound('Subscription not found');
        }
        return {
            ok: true,
            data: subscription
        };
    };
}

export function createUpsertSubscriptionController(app) {
    return async function upsertSubscriptionController(request) {
        await app.authGuard(request);
        const { tenantId } = request.params;
        const payload = upsertSubscriptionSchema.parse(request.body);
        const subscription = await upsertSubscription(app.db.models, tenantId, payload);
        return {
            ok: true,
            data: subscription
        };
    };
}
