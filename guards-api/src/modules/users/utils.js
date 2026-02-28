/**
 * Role hierarchy levels (higher number = higher privilege)
 */
const ROLE_HIERARCHY = {
    'admin': 3,
    'sub-admin': 2,
    'sales-head': 1,
    'dispatch-head': 1,
    'marketing-head': 1,
    'accounts-head': 1,
    'sales': 0,
    'dispatch': 0,
    'marketing': 0,
    'accounts': 0,
    'admin-depart': 0
};

/**
 * Gets the highest role level for a user
 * @param {Object} user - User object with roleEntities association or roles array
 * @returns {number} Highest role level (0 = lowest, 3 = highest)
 */
export function getUserHighestRoleLevel(user) {
    let roles = [];
    
    if (user.roleEntities && Array.isArray(user.roleEntities)) {
        roles = user.roleEntities.map(r => r.name);
    } else if (user.roles && Array.isArray(user.roles)) {
        roles = user.roles;
    }
    
    if (roles.length === 0) {
        return 0;
    }
    
    const levels = roles.map(roleName => ROLE_HIERARCHY[roleName] || 0);
    return Math.max(...levels);
}

/**
 * Checks if a user has a higher role level than another user
 * @param {Object} user1 - First user
 * @param {Object} user2 - Second user
 * @returns {boolean} True if user1 has higher role than user2
 */
export function hasHigherRole(user1, user2) {
    return getUserHighestRoleLevel(user1) > getUserHighestRoleLevel(user2);
}

/**
 * Computes roles and permissions from user associations
 * @param {Object} user - User object with roleEntities association
 * @returns {Object} Object with roles and permissions arrays
 */
export function computeUserRolesAndPermissions(user) {
    const roles = user.roleEntities?.map(r => r.name) || [];
    const permissions = new Set();
    
    user.roleEntities?.forEach(role => {
        role.permissionEntities?.forEach(perm => {
            permissions.add(perm.key);
        });
    });
    
    return {
        roles,
        permissions: Array.from(permissions)
    };
}

/**
 * Presents full user data with computed roles, permissions, and roleIds.
 * Keeps all nested data: department, roleEntities (with permissionEntities), commission, staff (if present).
 */
export function presentUser(user) {
    if (!user) return null;

    const { roles, permissions } = computeUserRolesAndPermissions(user);

    const userObj = user.toJSON ? user.toJSON() : { ...user };

    // Remove sensitive fields only
    delete userObj.passwordHash;
    delete userObj.password;

    // Role IDs for convenience (full roleEntities remain in response)
    const roleIds = userObj.roleEntities?.map((r) => r.id) || [];

    return {
        ...userObj,
        roles,
        permissions,
        roleIds,
        // Keep full commission object when present
        commission: userObj.commission ?? null,
        // department, roleEntities (with permissionEntities), staff are already in userObj from toJSON()
    };
}

/**
 * Presents multiple users with computed roles and permissions
 * @param {Array} users - Array of user objects
 * @returns {Array} Array of presented user objects
 */
export function presentUsers(users) {
    return users.map(presentUser);
}

/**
 * Presents user for list endpoint: full user data but without roleEntities, permissions, roleIds, commission.
 * Keeps: id, email, firstName, lastName, tenantId, departmentId, status, lastLoginAt, createdAt, updatedAt, department, roles, staff (imageUrl, salary, etc.).
 * Adds: url for frontend QR code — /public/guards/{userId}
 */
export function presentUserForList(user) {
    if (!user) return null;

    const { roles } = computeUserRolesAndPermissions(user);
    const userObj = user.toJSON ? user.toJSON() : { ...user };

    delete userObj.passwordHash;
    delete userObj.password;
    delete userObj.roleEntities;
    delete userObj.commission;

    const userId = userObj.id;

    return {
        ...userObj,
        roles,
        /** Public URL for this user/guard — use for QR code in frontend */
        url: `/public/guards/${userId}`,
        /** Top-level imageUrl and salary (stored on users table) */
        imageUrl: userObj.imageUrl ?? null,
        salary: userObj.salary != null ? Number(userObj.salary) : null
    };
}

/**
 * Presents multiple users for list endpoint
 */
export function presentUsersForList(users) {
    return users.map(presentUserForList);
}

