import { Op } from 'sequelize';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

function withAssociations(models) {
    return [
        {
            model: models.Room,
            as: 'room',
            required: false,
            attributes: ['id', 'name', 'status']
        }
    ];
}

export async function listBeds(models, options = {}) {
    const {
        search,
        limit = 50,
        offset = 0,
        orderBy = 'name',
        orderDir = 'ASC',
        roomId,
        status,
        available,
        quality
    } = options;

    const where = {};

    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { quality: { [Op.iLike]: `%${search}%` } }
        ];
    }

    if (roomId) where.roomId = roomId;

    if (available === 'true') {
        where.status = 'active';
    } else if (status) {
        where.status = status;
    }

    if (quality) where.quality = quality;

    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });

    const result = await models.Bed.findAndCountAll({
        where,
        include: withAssociations(models),
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]]
    });

    return formatPaginatedResult(
        { rows: result.rows.map(b => b.toJSON()), count: result.count },
        { page: 1, limit: safeLimit }
    );
}

export async function createBed(models, payload) {
    const bed = await models.Bed.create(payload);
    return findBedById(models, bed.id);
}

export async function findBedById(models, id) {
    const bed = await models.Bed.findByPk(id, {
        include: withAssociations(models)
    });

    return bed ? bed.toJSON() : null;
}

export async function updateBed(models, id, changes) {
    const bed = await models.Bed.findByPk(id);
    if (!bed) {
        return null;
    }

    await bed.update(changes);
    return findBedById(models, id);
}

export async function deleteBed(models, id) {
    const bed = await models.Bed.findByPk(id);
    if (!bed) {
        return null;
    }

    await bed.destroy();
    return bed;
}
