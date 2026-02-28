import { Op } from 'sequelize';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

export async function listRoles(models, options = {}) {
    const {
        search,
        departmentId,
        limit = 50,
        offset = 0,
        orderBy = 'createdAt',
        orderDir = 'DESC'
    } = options;

    const where = {};

    if (departmentId) {
        where.departmentId = departmentId;
    }

    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });

    const result = await models.Role.findAndCountAll({
        where,
        include: [{
            model: models.Permission,
            as: 'permissionEntities',
            through: { attributes: [] }
        }],
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]],
        distinct: true
    });

    return formatPaginatedResult(result, { page: 1, limit: safeLimit });
}

export async function createRole(models, payload) {
    const { permissionIds = [], ...rest } = payload;
    const role = await models.Role.create(rest);
    if (permissionIds.length > 0) {
        const permissions = await models.Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
        await role.setPermissionEntities(permissions);
    }
    return role.reload({ include: [{ model: models.Permission, as: 'permissionEntities', through: { attributes: [] } }] });
}

export async function findRoleById(models, id) {
    return models.Role.findByPk(id, {
        include: [{
            model: models.Permission,
            as: 'permissionEntities',
            through: { attributes: [] }
        }]
    });
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

    if (permissionIds !== undefined) {
        if (permissionIds.length > 0) {
            const permissions = await models.Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
            await role.setPermissionEntities(permissions);
        } else {
            await role.setPermissionEntities([]);
        }
    }

    return role.reload({ include: [{ model: models.Permission, as: 'permissionEntities', through: { attributes: [] } }] });
}

export async function deleteRole(models, id) {
    const role = await models.Role.findByPk(id);
    if (!role) {
        return null;
    }

    await role.destroy();
    return role;
}
