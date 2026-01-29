export function listPlans(models) {
    return models.Plan.findAll({
        order: [['createdAt', 'DESC']]
    });
}

export function createPlan(models, payload) {
    return models.Plan.create(payload);
}

export function findPlanById(models, id) {
    return models.Plan.findByPk(id);
}

export async function updatePlan(models, id, changes) {
    const plan = await models.Plan.findByPk(id);
    if (!plan) {
        return null;
    }

    await plan.update(changes);
    return plan;
}

export async function deletePlan(models, id) {
    const plan = await models.Plan.findByPk(id);
    if (!plan) {
        return null;
    }

    await plan.destroy();
    return plan;
}
