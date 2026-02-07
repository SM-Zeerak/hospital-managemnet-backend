import { Op } from 'sequelize';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

function withAssociations(models) {
    return [
        {
            model: models.Role,
            as: 'roles',
            required: false,
            attributes: ['id', 'name', 'description']
        }
    ];
}

export async function listDepartments(models, options = {}) {
    const {
        search,
        limit = 50,
        offset = 0,
        orderBy = 'name',
        orderDir = 'ASC'
    } = options;
    
    const where = {};
    
    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
    
    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });
    
    const result = await models.Department.findAndCountAll({
        where,
        include: withAssociations(models),
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]]
    });
    
    const departments = result.rows.map(dept => {
        const deptJson = dept.toJSON();
        deptJson.roles = deptJson.roles || [];
        return deptJson;
    });
    
    return formatPaginatedResult(
        { rows: departments, count: result.count },
        { page: 1, limit: safeLimit }
    );
}

export async function createDepartment(models, payload) {
    const department = await models.Department.create(payload);
    return findDepartmentById(models, department.id);
}

export async function findDepartmentById(models, id) {
    const department = await models.Department.findByPk(id, {
        include: withAssociations(models)
    });
    
    if (!department) {
        return null;
    }
    
    const deptJson = department.toJSON();
    deptJson.roles = deptJson.roles || [];
    
    return deptJson;
}

export async function updateDepartment(models, id, changes) {
    const department = await models.Department.findByPk(id);
    if (!department) {
        return null;
    }

    await department.update(changes);
    return findDepartmentById(models, id);
}

export async function deleteDepartment(models, id) {
    const department = await models.Department.findByPk(id);
    if (!department) {
        return null;
    }

    await department.destroy();
    return department;
}
