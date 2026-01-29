export function listVpsNodes(models) {
    return models.VpsNode.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: models.Tenant, as: 'tenants' }]
    });
}

export function createVpsNode(models, payload) {
    return models.VpsNode.create(payload);
}

export async function updateVpsNode(models, id, changes) {
    const node = await models.VpsNode.findByPk(id);
    if (!node) {
        return null;
    }

    await node.update(changes);
    return node.reload({ include: [{ model: models.Tenant, as: 'tenants' }] });
}

export async function deleteVpsNode(models, id) {
    const node = await models.VpsNode.findByPk(id);
    if (!node) {
        return null;
    }

    await node.destroy();
    return node;
}

export async function checkCapacity(models, id, tenantsToAdd) {
    const node = await models.VpsNode.findByPk(id, {
        include: [{ model: models.Tenant, as: 'tenants' }]
    });
    if (!node) {
        return null;
    }

    const current = node.tenants?.length || 0;
    const available = node.capacity - current;
    const canAccommodate = available >= tenantsToAdd;

    return {
        node,
        current,
        available,
        requested: tenantsToAdd,
        canAccommodate
    };
}
