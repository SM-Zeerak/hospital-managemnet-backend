import { Op } from 'sequelize';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

export async function listRoles(models, options = {}) {
    const {
        search,
        limit = 50,
        offset = 0,
        orderBy = 'createdAt',
        orderDir = 'DESC'
    } = options;
    
    const where = {};
    
    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
    
    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });
    
    const result = await models.Role.findAndCountAll({
        where,
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]],
        distinct: true
    });
    
    return formatPaginatedResult(result, { page: 1, limit: safeLimit });
}

export async function createRole(models, payload) {
    const { permissionIds = [], ...rest } = payload;
    // permissions are now stored directly on users, not via role mappings.
    const role = await models.Role.create(rest);
    return role;
}

export async function findRoleById(models, id) {
    return models.Role.findByPk(id);
}

export async function updateRole(models, id, changes) {
    const { permissionIds, ...rest } = changes;
    const role = await models.Role.findByPk(id);
    if (!role) {
        return null;
    }

    if (Object.keys(rest).length > 0) {
        await role.update(rest);
    }

    // permissionIds no longer handled at role level

    return role;
}

export async function deleteRole(models, id) {
    const role = await models.Role.findByPk(id);
    if (!role) {
        return null;
    }

    await role.destroy();
    return role;
}
