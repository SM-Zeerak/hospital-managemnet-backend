export function listFeatures(models) {
    return models.Feature.findAll({
        order: [['createdAt', 'DESC']]
    });
}

export function createFeature(models, payload) {
    return models.Feature.create(payload);
}

export function findFeatureById(models, id) {
    return models.Feature.findByPk(id);
}

export async function updateFeature(models, id, changes) {
    const feature = await models.Feature.findByPk(id);
    if (!feature) {
        return null;
    }

    await feature.update(changes);
    return feature;
}

export async function deleteFeature(models, id) {
    const feature = await models.Feature.findByPk(id);
    if (!feature) {
        return null;
    }

    await feature.destroy();
    return feature;
}

export function listTenantFeatures(models, tenantId) {
    return models.TenantFeature.findAll({
        where: { tenantId },
        include: [{ model: models.Feature, as: 'feature' }]
    });
}

export async function upsertTenantFeatures(models, tenantId, assignments) {
    const rows = [];

    for (const assignment of assignments) {
        const [row] = await models.TenantFeature.findOrCreate({
            where: {
                tenantId,
                featureId: assignment.featureId
            },
            defaults: {
                tenantId,
                featureId: assignment.featureId,
                enabled: assignment.enabled,
                valueJson: assignment.valueJson ?? null
            }
        });

        if (row.enabled !== assignment.enabled || JSON.stringify(row.valueJson) !== JSON.stringify(assignment.valueJson ?? null)) {
            await row.update({
                enabled: assignment.enabled,
                valueJson: assignment.valueJson ?? null
            });
        }

        rows.push(row);
    }

    return rows;
}
