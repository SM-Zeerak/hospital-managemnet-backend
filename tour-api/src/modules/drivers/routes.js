import * as controller from './controller.js';
import * as schemas from './schemas.js';

export default async function (fastify) {
    fastify.get('/', {
        schema: schemas.listDriversSchema,
        preHandler: [fastify.authenticate]
    }, controller.listDrivers);

    fastify.post('/', {
        schema: schemas.createDriverSchema,
        preHandler: [fastify.authenticate]
    }, controller.createDriver);

    fastify.get('/:id', {
        schema: schemas.getDriverSchema,
        preHandler: [fastify.authenticate]
    }, controller.getDriver);

    fastify.patch('/:id', {
        schema: schemas.updateDriverSchema,
        preHandler: [fastify.authenticate]
    }, controller.updateDriver);

    fastify.delete('/:id', {
        schema: schemas.getDriverSchema,
        preHandler: [fastify.authenticate]
    }, controller.deleteDriver);
}
