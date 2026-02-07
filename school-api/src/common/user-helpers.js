import { Op } from 'sequelize';

export async function findUsersByRole(models, roleName, tenantId = null) {
    const where = {};
    if (tenantId) {
        where.tenantId = tenantId;
    }
    
    const users = await models.TenantUser.findAll({
        where,
        include: [
            {
                model: models.Role,
                as: 'roleEntities',
                through: { attributes: [] },
                where: { name: roleName },
                required: true
            }
        ],
        attributes: ['id', 'email', 'firstName', 'lastName', 'tenantId'],
        distinct: true
    });
    
    return users;
}

export async function findUsersByDepartment(models, departmentName, tenantId = null) {
    const department = await models.Department.findOne({
        where: { name: departmentName }
    });
    
    if (!department) {
        return [];
    }
    
    const where = {};
    if (tenantId) {
        where.tenantId = tenantId;
    }
    where.departmentId = department.id;
    
    const users = await models.TenantUser.findAll({
        where,
        attributes: ['id', 'email', 'firstName', 'lastName', 'tenantId']
    });
    
    return users;
}

export async function findUsersByRoleOrDepartment(models, roleName, departmentName, tenantId = null) {
    const [roleUsers, deptUsers] = await Promise.all([
        findUsersByRole(models, roleName, tenantId),
        findUsersByDepartment(models, departmentName, tenantId)
    ]);
    
    const allUserIds = new Set();
    const allUsers = [];
    
    [...roleUsers, ...deptUsers].forEach(user => {
        if (!allUserIds.has(user.id)) {
            allUserIds.add(user.id);
            allUsers.push(user);
        }
    });
    
    return allUsers;
}

