export async function listAuditEvents(models, filters) {
    const { ProvisioningAudit, Tenant } = models;
    const { tenantId, step, status, page = 1, limit = 20 } = filters;
    const where = {};

    if (tenantId) {
        where.tenantId = tenantId;
    }

    if (step) {
        where.step = step;
    }

    if (status) {
        where.status = status;
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await ProvisioningAudit.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [{ model: Tenant, as: 'tenant' }],
        limit,
        offset
    });

    return {
        data: rows,
        meta: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
}

export function createAuditEvent(models, payload) {
    return models.ProvisioningAudit.create(payload);
}
