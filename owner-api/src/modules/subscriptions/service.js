export function getSubscription(models, tenantId) {
    return models.Subscription.findOne({
        where: { tenantId },
        include: [{ model: models.Plan, as: 'plan' }]
    });
}

export async function upsertSubscription(models, tenantId, payload) {
    const existing = await models.Subscription.findOne({ where: { tenantId } });
    if (existing) {
        await existing.update(payload);
        return existing;
    }
    return models.Subscription.create({
        tenantId,
        ...payload
    });
}
