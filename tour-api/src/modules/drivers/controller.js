import * as service from './service.js';

export async function listDrivers(request, reply) {
    const { models } = request.server.db;
    const tenantId = request.tenant?.id;

    const result = await service.listDrivers(models, {
        ...request.query,
        tenantId
    });

    return reply.send(result);
}

export async function createDriver(request, reply) {
    const { models } = request.server.db;
    const tenantId = request.tenant?.id;

    try {
        const driver = await service.createDriver(models, request.body, tenantId);
        return reply.status(201).send(driver);
    } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ message: error.message });
    }
}

export async function getDriver(request, reply) {
    const { models } = request.server.db;
    const tenantId = request.tenant?.id;
    const { id } = request.params;

    const driver = await service.findDriverById(models, id, tenantId);

    if (!driver) {
        return reply.status(404).send({ message: 'Driver not found' });
    }

    return reply.send(driver);
}

export async function updateDriver(request, reply) {
    const { models } = request.server.db;
    const tenantId = request.tenant?.id;
    const { id } = request.params;

    const driver = await service.updateDriver(models, id, request.body, tenantId);

    if (!driver) {
        return reply.status(404).send({ message: 'Driver not found' });
    }

    return reply.send(driver);
}

export async function deleteDriver(request, reply) {
    const { models } = request.server.db;
    const tenantId = request.tenant?.id;
    const { id } = request.params;

    const result = await service.deleteDriver(models, id, tenantId);

    if (!result) {
        return reply.status(404).send({ message: 'Driver not found' });
    }

    return reply.send(result);
}
