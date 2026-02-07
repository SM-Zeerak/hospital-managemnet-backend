import { Op } from 'sequelize';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

export async function listPermissions(models, options = {}) {
    const {
        search,
        limit = 50,
        offset = 0,
        orderBy = 'key',
        orderDir = 'ASC'
    } = options;
    
    const where = {};
    
    if (search) {
        where[Op.or] = [
            { key: { [Op.iLike]: `%${search}%` } },
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
    
    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });
    
    const result = await models.Permission.findAndCountAll({
        where,
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]]
    });
    
    return formatPaginatedResult(result, { page: 1, limit: safeLimit });
}

export function createPermission(models, payload) {
    return models.Permission.create(payload);
}

export function findPermissionById(models, id) {
    return models.Permission.findByPk(id);
}

export async function updatePermission(models, id, changes) {
    const permission = await models.Permission.findByPk(id);
    if (!permission) {
        return null;
    }

    await permission.update(changes);
    return permission;
}

export async function deletePermission(models, id) {
    const permission = await models.Permission.findByPk(id);
    if (!permission) {
        return null;
    }

    await permission.destroy();
    return permission;
}
