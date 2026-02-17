import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { createHash } from 'node:crypto';
import {
    computeUserRolesAndPermissions,
    presentUser,
    presentUsers,
    getUserHighestRoleLevel,
    hasHigherRole
} from './utils.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';

const TOKEN_HASH_ALGO = 'sha256';
const INVITE_TOKEN_TTL_DAYS = 7;

function withAssociations(models) {
    const associations = [
        { model: models.Department, as: 'department', required: false },
        {
            model: models.Role,
            as: 'roleEntities',
            through: { attributes: [] },
            required: false,
            include: [
                {
                    model: models.Permission,
                    as: 'permissionEntities',
                    through: { attributes: [] },
                    required: false
                }
            ]
        }
    ];

    // Only include Staff if the model exists
    if (models.Staff) {
        associations.push({
            model: models.Staff,
            as: 'staff',
            required: false,
            include: [
                { model: models.Department, as: 'department', required: false },
                { model: models.Role, as: 'role', required: false }
            ]
        });
    }

    return associations;
}

export async function getUserStats(models, tenantId, requesterId = null, requesterRoles = null) {
    const { TenantUser, UserInvite } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const where = { tenantId };

    // Always exclude the requester user
    if (requesterId) {
        where.id = { [Op.ne]: requesterId };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Build where clause for previous period
    const prevWhere = {
        ...where,
        createdAt: { [Op.lte]: thirtyDaysAgo, [Op.gte]: sixtyDaysAgo }
    };

    // Get all users to filter by role level if needed
    let userFilter = null;
    if (requesterRoles && Array.isArray(requesterRoles) && requesterRoles.length > 0) {
        const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });

        // Fetch all users to filter by role level
        const allUsers = await TenantUser.findAll({
            where,
            include: [
                {
                    model: models.Role,
                    as: 'roleEntities',
                    through: { attributes: [] },
                    required: false
                }
            ],
            attributes: ['id', 'status', 'createdAt']
        });

        const filteredUserIds = allUsers
            .filter(user => {
                // Double-check: exclude requester
                if (requesterId && user.id === requesterId) {
                    return false;
                }
                // Exclude users with higher roles
                const userLevel = getUserHighestRoleLevel(user);
                return userLevel <= requesterLevel;
            })
            .map(user => user.id);

        if (filteredUserIds.length > 0) {
            userFilter = { [Op.in]: filteredUserIds };
        } else {
            // No users match the criteria, return zero stats
            userFilter = { [Op.in]: [] };
        }
    }

    // Apply user filter if we have one
    const currentWhere = userFilter ? { ...where, id: userFilter } : where;
    const prevWhereFiltered = userFilter ? { ...prevWhere, id: userFilter } : prevWhere;

    // Current period counts (last 30 days)
    const countPromises = [
        TenantUser.count({ where: currentWhere }),
        TenantUser.count({ where: { ...currentWhere, status: 'active' } }),
        TenantUser.count({ where: { ...currentWhere, status: 'suspended' } })
    ];

    // Only count invites if UserInvite model exists
    if (UserInvite) {
        countPromises.push(
            UserInvite.count({
                where: {
                    tenantId,
                    status: 'pending',
                    expiresAt: { [Op.gt]: now }
                }
            })
        );
    } else {
        countPromises.push(Promise.resolve(0));
    }

    const [totalUsers, activeUsers, suspendedUsers, pendingInvites] = await Promise.all(countPromises);

    // Previous period counts (30-60 days ago) for percentage calculation
    const prevCountPromises = [
        TenantUser.count({ where: prevWhereFiltered }),
        TenantUser.count({
            where: {
                ...prevWhereFiltered,
                status: 'active'
            }
        }),
        TenantUser.count({
            where: {
                ...prevWhereFiltered,
                status: 'suspended'
            }
        })
    ];

    // Only count previous invites if UserInvite model exists
    if (UserInvite) {
        prevCountPromises.push(
            UserInvite.count({
                where: {
                    tenantId,
                    status: 'pending',
                    createdAt: { [Op.lte]: thirtyDaysAgo, [Op.gte]: sixtyDaysAgo }
                }
            })
        );
    } else {
        prevCountPromises.push(Promise.resolve(0));
    }

    const [prevTotalUsers, prevActiveUsers, prevSuspendedUsers, prevPendingInvites] = await Promise.all(prevCountPromises);

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return {
        total: {
            value: totalUsers,
            change: calculatePercentageChange(totalUsers, prevTotalUsers),
            period: 'Past month'
        },
        active: {
            value: activeUsers,
            change: calculatePercentageChange(activeUsers, prevActiveUsers),
            period: 'Past month'
        },
        suspended: {
            value: suspendedUsers,
            change: calculatePercentageChange(suspendedUsers, prevSuspendedUsers),
            period: 'Past month'
        },
        pendingInvites: {
            value: pendingInvites,
            change: calculatePercentageChange(pendingInvites, prevPendingInvites),
            period: 'Past month'
        }
    };
}

export async function listUsers(models, options = {}) {
    const { TenantUser } = models;
    const {
        tenantId,
        requesterId,
        requesterRoles,
        search,
        status,
        departmentId,
        roleId,
        dateFrom,
        dateTo,
        limit = 50,
        offset = 0,
        orderBy = 'createdAt',
        orderDir = 'DESC'
    } = options;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const where = {
        tenantId
    };

    // Always exclude the requester user
    if (requesterId) {
        where.id = { [Op.ne]: requesterId };
    }

    if (search) {
        where[Op.or] = [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
        ];
    }

    if (status) {
        where.status = status;
    }

    if (departmentId) {
        where.departmentId = departmentId;
    }

    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const include = withAssociations(models);

    if (roleId) {
        include.push({
            model: models.Role,
            as: 'roleEntities',
            where: { id: roleId },
            required: true,
            through: { attributes: [] }
        });
    }

    const users = await TenantUser.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[orderBy, orderDir]],
        distinct: true
    });

    // Filter out users with higher roles than requester AND the requester themselves
    let filteredUsers = users.rows;
    let filteredCount = users.count;

    if (requesterId || (requesterRoles && Array.isArray(requesterRoles) && requesterRoles.length > 0)) {
        const requesterLevel = requesterRoles && requesterRoles.length > 0
            ? getUserHighestRoleLevel({ roles: requesterRoles })
            : 999; // If no roles, allow all (shouldn't happen)

        filteredUsers = users.rows.filter(user => {
            // Always exclude the requester (double-check in case where clause didn't work)
            if (requesterId && user.id === requesterId) {
                return false;
            }

            // Exclude users with higher roles
            if (requesterRoles && requesterRoles.length > 0) {
                const userLevel = getUserHighestRoleLevel(user);
                return userLevel <= requesterLevel;
            }

            return true;
        });

        filteredCount = filteredUsers.length;
    }

    return {
        data: presentUsers(filteredUsers),
        pagination: {
            total: filteredCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(filteredCount / limit)
        }
    };
}

export async function createUser(models, data, tenantId, inviterId = null) {
    const { TenantUser, Role, Department, UserCommission, Staff } = models;
    const { password, roleIds = [], commisionType, commisionValue, departmentId, staff: staffData, ...rest } = data;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    delete rest.tenantId;

    // Validate department exists if provided
    if (departmentId) {
        const department = await Department.findOne({
            where: { id: departmentId }
        });
        if (!department) {
            const error = new Error(`Department with ID ${departmentId} does not exist`);
            error.statusCode = 400;
            error.code = 'INVALID_REFERENCE';
            throw error;
        }
    }

    // Validate all roles exist if provided
    if (roleIds.length > 0) {
        const roles = await Role.findAll({
            where: {
                id: { [Op.in]: roleIds }
            }
        });
        if (roles.length !== roleIds.length) {
            const foundIds = roles.map(r => r.id);
            const missingIds = roleIds.filter(id => !foundIds.includes(id));
            const error = new Error(`One or more roles do not exist: ${missingIds.join(', ')}`);
            error.statusCode = 400;
            error.code = 'INVALID_REFERENCE';
            throw error;
        }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await TenantUser.create({
        ...rest,
        departmentId,
        tenantId,
        passwordHash
    });

    // Only create commission if UserCommission model exists
    if (commisionType && commisionValue !== undefined && UserCommission) {
        await UserCommission.create({
            userId: user.id,
            tenantId,
            commissionType: commisionType,
            commissionValue: commisionValue
        });
    }

    // Assign roles if provided
    if (roleIds.length > 0) {
        const roles = await Role.findAll({ where: { id: { [Op.in]: roleIds } } });
        await user.setRoleEntities(roles);
    }

    // Create staff record if provided
    if (staffData && Staff) {
        // Automatically link department and role if not provided in staffData but available from user level
        // (Staff can have its own department/role for more specific assignment if needed)
        await Staff.create({
            ...staffData,
            userId: user.id,
            tenantId,
            departmentId: staffData.departmentId || departmentId,
            roleId: staffData.roleId || (roleIds.length > 0 ? roleIds[0] : null)
        });
    }

    // Reload user with associations - use findOne with tenantId for safety
    const userWithAssociations = await TenantUser.findOne({
        where: {
            id: user.id,
            tenantId
        },
        include: withAssociations(models)
    });

    if (!userWithAssociations) {
        throw new Error('User not found after creation - possible data integrity issue');
    }

    // Verify tenant isolation
    if (userWithAssociations.tenantId !== tenantId) {
        throw new Error('Tenant isolation violation detected after user creation');
    }

    return presentUser(userWithAssociations);
}

export async function findUserById(models, id, tenantId, requesterId = null, requesterRoles = null) {
    const { TenantUser } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    // Never allow a user to get themselves
    if (requesterId && id === requesterId) {
        return null;
    }

    const user = await TenantUser.findOne({
        where: {
            id,
            tenantId
        },
        include: withAssociations(models)
    });

    if (!user) {
        return null;
    }

    // Check if user has higher role than requester
    if (requesterRoles && Array.isArray(requesterRoles) && requesterRoles.length > 0) {
        const requesterLevel = getUserHighestRoleLevel({ roles: requesterRoles });
        const userLevel = getUserHighestRoleLevel(user);

        if (userLevel > requesterLevel) {
            return null; // User has higher role, don't return
        }
    }

    return presentUser(user);
}

export async function updateUser(models, id, changes, tenantId, updaterId = null) {
    const { TenantUser, Role, UserCommission, Staff } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    // First, verify the user exists and belongs to the tenant
    const user = await TenantUser.findOne({
        where: {
            id,
            tenantId
        },
        include: withAssociations(models)
    });

    if (!user) {
        return null;
    }

    // Store the user ID to ensure we're working with the correct user instance
    const targetUserId = user.id;

    const { roleIds, password, commisionType, commisionValue, staff: staffData, ...rest } = changes;

    if (password) {
        rest.passwordHash = await bcrypt.hash(password, 10);
    }

    delete rest.tenantId;

    await user.update(rest);

    // Only handle commission if UserCommission model exists
    if (UserCommission && (commisionType !== undefined || commisionValue !== undefined)) {
        const existingCommission = await UserCommission.findOne({
            where: { userId: user.id, tenantId }
        });

        if (existingCommission) {
            await existingCommission.update({
                commissionType: commisionType ?? existingCommission.commissionType,
                commissionValue: commisionValue ?? existingCommission.commissionValue
            });
        } else if (commisionType && commisionValue !== undefined) {
            await UserCommission.create({
                userId: user.id,
                tenantId,
                commissionType: commisionType,
                commissionValue: commisionValue
            });
        }
    }

    // Update staff details if provided
    if (staffData && Staff) {
        const existingStaff = await Staff.findOne({
            where: { userId: user.id, tenantId }
        });

        if (existingStaff) {
            await existingStaff.update(staffData);
        } else {
            await Staff.create({
                ...staffData,
                userId: user.id,
                tenantId
            });
        }
    }

    // Update roles if provided - setRoleEntities is scoped to this user instance
    // Sequelize's setRoleEntities will:
    // 1. Delete existing role mappings for THIS user only (WHERE user_id = user.id)
    // 2. Insert new role mappings for THIS user only (WHERE user_id = user.id)
    if (roleIds !== undefined) {
        if (roleIds.length > 0) {
            // Verify all role IDs exist and belong to the same tenant (roles are tenant-scoped)
            const roles = await Role.findAll({
                where: {
                    id: { [Op.in]: roleIds }
                }
            });

            // Double-check: ensure we're setting roles on the correct user instance
            if (user.id !== targetUserId) {
                throw new Error('User instance mismatch during role update');
            }

            await user.setRoleEntities(roles);
        } else {
            // Remove all roles for this user
            await user.setRoleEntities([]);
        }
    }

    // Reload user with associations to get updated roles
    // Use findOne with tenantId to ensure tenant isolation even after update
    const updatedUser = await TenantUser.findOne({
        where: {
            id: targetUserId,
            tenantId
        },
        include: withAssociations(models)
    });

    if (!updatedUser) {
        throw new Error('User not found after update - possible data integrity issue');
    }

    // Final verification: ensure the reloaded user still belongs to the correct tenant
    if (updatedUser.tenantId !== tenantId) {
        throw new Error('Tenant isolation violation detected after user update');
    }

    return presentUser(updatedUser);
}

export async function activateUser(models, id, tenantId) {
    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const user = await models.TenantUser.findOne({
        where: {
            id,
            tenantId
        }
    });

    if (!user) {
        return null;
    }

    await user.update({ status: 'active' });
    const updatedUser = await models.TenantUser.findByPk(id, {
        include: withAssociations(models)
    });

    return presentUser(updatedUser);
}

export async function suspendUser(models, id, tenantId) {
    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const user = await models.TenantUser.findOne({
        where: {
            id,
            tenantId
        }
    });

    if (!user) {
        return null;
    }

    await user.update({ status: 'suspended' });
    const updatedUser = await models.TenantUser.findByPk(id, {
        include: withAssociations(models)
    });

    return presentUser(updatedUser);
}

export async function deleteUser(models, id, tenantId) {
    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const user = await models.TenantUser.findOne({
        where: {
            id,
            tenantId
        }
    });

    if (!user) {
        return null;
    }

    await user.destroy();
    return { id };
}

// User Invite functions
export function hashInviteToken(token) {
    return createHash(TOKEN_HASH_ALGO).update(token).digest('hex');
}

export async function createUserInvite(models, data, tenantId, inviterId) {
    const { UserInvite } = models;
    const { email, firstName, lastName, departmentId, roleIds = [] } = data;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    // Check if user already exists in this tenant
    const existingUser = await models.TenantUser.findOne({
        where: {
            email,
            tenantId
        }
    });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Check for existing pending invite in this tenant
    const existingInvite = await UserInvite.findOne({
        where: {
            email,
            tenantId,
            status: 'pending',
            expiresAt: { [Op.gt]: new Date() }
        }
    });

    if (existingInvite) {
        throw new Error('Pending invite already exists for this email');
    }

    const token = randomUUID();
    const tokenHash = hashInviteToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_TTL_DAYS);

    const invite = await UserInvite.create({
        email,
        firstName,
        lastName,
        departmentId,
        tenantId,
        invitedBy: inviterId,
        token,
        tokenHash,
        expiresAt,
        status: 'pending'
    });

    const inviteWithAssociations = await UserInvite.findByPk(invite.id, {
        include: [
            { model: models.TenantUser, as: 'inviter', required: false },
            { model: models.Department, as: 'department', required: false }
        ]
    });

    return {
        invite: inviteWithAssociations,
        token
    };
}

export async function listUserInvites(models, options = {}) {
    const { UserInvite } = models;
    const {
        tenantId,
        status = 'pending',
        search,
        limit = 50,
        offset = 0
    } = options;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const where = {
        tenantId
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where[Op.or] = [
            { email: { [Op.iLike]: `%${search}%` } },
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const invites = await UserInvite.findAndCountAll({
        where,
        include: [
            { model: models.TenantUser, as: 'inviter', required: false },
            { model: models.Department, as: 'department', required: false }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    return {
        data: invites.rows,
        pagination: {
            total: invites.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(invites.count / limit)
        }
    };
}

export async function resendUserInvite(models, inviteId, tenantId, inviterId) {
    const { UserInvite } = models;

    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const invite = await UserInvite.findOne({
        where: {
            id: inviteId,
            tenantId
        }
    });

    if (!invite) {
        return null;
    }

    if (invite.status !== 'pending') {
        throw new Error('Can only resend pending invites');
    }

    if (invite.expiresAt < new Date()) {
        throw new Error('Invite has expired');
    }

    const token = randomUUID();
    const tokenHash = hashInviteToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_TTL_DAYS);

    await invite.update({
        token,
        tokenHash,
        expiresAt,
        invitedBy: inviterId
    });

    const updatedInvite = await UserInvite.findByPk(inviteId, {
        include: [
            { model: models.TenantUser, as: 'inviter', required: false },
            { model: models.Department, as: 'department', required: false }
        ]
    });

    return {
        invite: updatedInvite,
        token
    };
}

export async function cancelUserInvite(models, inviteId, tenantId) {
    if (!tenantId) {
        throw new Error('tenantId is required for tenant isolation');
    }

    const invite = await models.UserInvite.findOne({
        where: {
            id: inviteId,
            tenantId
        }
    });

    if (!invite) {
        return null;
    }

    await invite.update({ status: 'cancelled' });
    return invite;
}

export async function acceptUserInvite(models, token, password) {
    const { UserInvite, TenantUser, Role } = models;
    const tokenHash = hashInviteToken(token);

    const invite = await UserInvite.findOne({
        where: {
            tokenHash,
            status: 'pending'
        },
        include: [
            { model: models.Department, as: 'department', required: false }
        ]
    });

    if (!invite) {
        return { ok: false, reason: 'invite_not_found' };
    }

    if (!invite.tenantId) {
        return { ok: false, reason: 'invite_invalid' };
    }

    if (invite.expiresAt < new Date()) {
        return { ok: false, reason: 'invite_expired' };
    }

    if (invite.acceptedAt) {
        return { ok: false, reason: 'invite_already_accepted' };
    }

    // Check if user already exists in this tenant
    const existingUser = await TenantUser.findOne({
        where: {
            email: invite.email,
            tenantId: invite.tenantId
        }
    });
    if (existingUser) {
        await invite.update({ status: 'cancelled', acceptedAt: new Date() });
        return { ok: false, reason: 'user_already_exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const tenantId = invite.tenantId;

    const user = await TenantUser.create({
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        departmentId: invite.departmentId,
        tenantId,
        passwordHash,
        status: 'active'
    });

    // Mark invite as accepted
    await invite.update({
        acceptedAt: new Date(),
        status: 'accepted'
    });

    const userWithAssociations = await TenantUser.findByPk(user.id, {
        include: withAssociations(models)
    });

    return {
        ok: true,
        user: presentUser(userWithAssociations)
    };
}

export async function uploadUserImage(fileBuffer) {
    const result = await uploadToCloudinary(fileBuffer, 'staff_images');
    return result.secure_url;
}
