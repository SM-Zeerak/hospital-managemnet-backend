import { Op } from 'sequelize';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

function withAssociations(models) {
    return [
        {
            model: models.Bed,
            as: 'beds',
            required: false,
            attributes: ['id', 'name', 'status', 'quality', 'rate']
        }
    ];
}

export async function listRooms(models, options = {}) {
    const {
        search,
        limit = 50,
        offset = 0,
        orderBy = 'name',
        orderDir = 'ASC',
        status
    } = options;

    const where = {};

    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }

    if (status) where.status = status;

    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });

    const result = await models.Room.findAndCountAll({
        where,
        include: withAssociations(models),
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]]
    });

    return formatPaginatedResult(
        { rows: result.rows.map(r => r.toJSON()), count: result.count },
        { page: 1, limit: safeLimit }
    );
}

export async function createRoom(models, payload) {
    const { bedIds, ...roomData } = payload;

    return await models.Room.sequelize.transaction(async (t) => {
        const room = await models.Room.create(roomData, { transaction: t });

        if (bedIds && bedIds.length > 0) {
            await models.Bed.update(
                { roomId: room.id },
                { where: { id: { [Op.in]: bedIds } }, transaction: t }
            );
        }

        return findRoomById(models, room.id, { transaction: t });
    });
}

export async function findRoomById(models, id, options = {}) {
    const { transaction } = options;
    const room = await models.Room.findByPk(id, {
        include: withAssociations(models),
        transaction
    });

    return room ? room.toJSON() : null;
}

export async function updateRoom(models, id, changes) {
    const { bedIds, ...roomData } = changes;

    return await models.Room.sequelize.transaction(async (t) => {
        const room = await models.Room.findByPk(id, { transaction: t });
        if (!room) {
            return null;
        }

        if (Object.keys(roomData).length > 0) {
            await room.update(roomData, { transaction: t });
        }

        if (bedIds !== undefined) {
            // Unassign beds currently in this room
            await models.Bed.update(
                { roomId: null },
                { where: { roomId: id }, transaction: t }
            );

            if (bedIds.length > 0) {
                // Assign new beds
                await models.Bed.update(
                    { roomId: id },
                    { where: { id: { [Op.in]: bedIds } }, transaction: t }
                );
            }
        }

        return findRoomById(models, id, { transaction: t });
    });
}

export async function deleteRoom(models, id) {
    const room = await models.Room.findByPk(id);
    if (!room) {
        return null;
    }

    await room.destroy();
    return room;
}
