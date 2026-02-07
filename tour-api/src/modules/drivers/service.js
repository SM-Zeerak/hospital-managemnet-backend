import { Op } from 'sequelize';

export async function listDrivers(models, options = {}) {
    const { Driver } = models;
    const {
        tenantId,
        search,
        status,
        limit = 50,
        offset = 0,
        orderBy = 'createdAt',
        orderDir = 'DESC'
    } = options;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const where = { tenantId };

    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { driverId: { [Op.iLike]: `%${search}%` } },
            { mobile: { [Op.iLike]: `%${search}%` } }
        ];
    }

    if (status) {
        where.status = status;
    }

    const { rows, count } = await Driver.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[orderBy, orderDir]]
    });

    return {
        data: rows,
        pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(count / limit)
        }
    };
}

export async function createDriver(models, data, tenantId) {
    const { Driver } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    // Check if driver with same UID or Email already exists in this tenant
    const existingDriver = await Driver.findOne({
        where: {
            [Op.or]: [
                { uid: data.uid },
                { email: data.email }
            ],
            tenantId
        }
    });

    if (existingDriver) {
        throw new Error('Driver with this UID or Email already exists');
    }

    const driver = await Driver.create({
        ...data,
        tenantId
    });

    return driver;
}

export async function findDriverById(models, id, tenantId) {
    const { Driver } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const driver = await Driver.findOne({
        where: { id, tenantId }
    });

    return driver;
}

export async function updateDriver(models, id, changes, tenantId) {
    const { Driver } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const driver = await Driver.findOne({
        where: { id, tenantId }
    });

    if (!driver) {
        return null;
    }

    await driver.update(changes);

    return driver;
}

export async function deleteDriver(models, id, tenantId) {
    const { Driver } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const driver = await Driver.findOne({
        where: { id, tenantId }
    });

    if (!driver) {
        return null;
    }

    await driver.destroy();

    return { id };
}
