import { initTenantUserModel } from './user.js';
import { initDepartmentModel } from './department.js';
import { initRoleModel } from './role.js';
import { initPermissionModel } from './permission.js';
import { initRolePermissionModel } from './role-permission.js';
import { initTenantPasswordResetModel } from './tenant-password-reset.js';
import { initTenantSessionModel } from './tenant-session.js';
import { initTenantEmailVerificationModel } from './tenant-email-verification.js';
import { initDriverModel } from './driver.js';

function applyAssociations(models) {
    const {
        TenantUser,
        Department,
        Role,
        Permission,
        RolePermission,
        TenantPasswordReset,
        TenantSession,
        TenantEmailVerification,
        Driver
    } = models;

    // Department <-> User associations
    if (Department && TenantUser) {
        Department.hasMany(TenantUser, {
            as: 'users',
            foreignKey: 'departmentId'
        });

        TenantUser.belongsTo(Department, {
            as: 'department',
            foreignKey: 'departmentId'
        });
    }

    // Department <-> Role associations
    if (Department && Role) {
        Department.hasMany(Role, {
            as: 'roles',
            foreignKey: 'departmentId'
        });

        Role.belongsTo(Department, {
            as: 'department',
            foreignKey: 'departmentId'
        });
    }

    // User <-> Role associations (many-to-many)
    if (TenantUser && Role) {
        TenantUser.belongsToMany(Role, {
            through: 'user_role_map',
            as: 'roleEntities',
            foreignKey: 'user_id',
            otherKey: 'role_id'
        });

        Role.belongsToMany(TenantUser, {
            through: 'user_role_map',
            as: 'userEntities',
            foreignKey: 'role_id',
            otherKey: 'user_id'
        });
    }

    // Role <-> Permission associations (many-to-many)
    if (Role && Permission) {
        Role.belongsToMany(Permission, {
            through: RolePermission,
            as: 'permissionEntities',
            foreignKey: 'role_id',
            otherKey: 'permission_id'
        });

        Permission.belongsToMany(Role, {
            through: RolePermission,
            as: 'roleEntities',
            foreignKey: 'permission_id',
            otherKey: 'role_id'
        });
    }

    // Password Reset associations
    if (TenantUser && TenantPasswordReset) {
        TenantUser.hasMany(TenantPasswordReset, {
            as: 'passwordResets',
            foreignKey: 'userId'
        });

        TenantPasswordReset.belongsTo(TenantUser, {
            as: 'user',
            foreignKey: 'userId'
        });
    }

    // Session associations
    if (TenantUser && TenantSession) {
        TenantUser.hasMany(TenantSession, {
            as: 'sessions',
            foreignKey: 'userId'
        });

        TenantSession.belongsTo(TenantUser, {
            as: 'user',
            foreignKey: 'userId'
        });
    }

    // Email Verification associations
    if (TenantUser && TenantEmailVerification) {
        TenantUser.hasMany(TenantEmailVerification, {
            as: 'emailVerifications',
            foreignKey: 'userId'
        });

        TenantEmailVerification.belongsTo(TenantUser, {
            as: 'user',
            foreignKey: 'userId'
        });
    }
}

export function initModels(sequelize) {
    const models = {
        TenantUser: initTenantUserModel(sequelize),
        Department: initDepartmentModel(sequelize),
        Role: initRoleModel(sequelize),
        Permission: initPermissionModel(sequelize),
        RolePermission: initRolePermissionModel(sequelize),
        TenantPasswordReset: initTenantPasswordResetModel(sequelize),
        TenantSession: initTenantSessionModel(sequelize),
        TenantEmailVerification: initTenantEmailVerificationModel(sequelize),
        Driver: initDriverModel(sequelize)
    };

    applyAssociations(models);

    return models;
}
