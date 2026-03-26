import { initTenantUserModel } from './user.js';
import { initDepartmentModel } from './department.js';
import { initRoleModel } from './role.js';
import { initPermissionModel } from './permission.js';
import { initRolePermissionModel } from './role-permission.js';
import { initTenantPasswordResetModel } from './tenant-password-reset.js';
import { initTenantSessionModel } from './tenant-session.js';
import { initTenantEmailVerificationModel } from './tenant-email-verification.js';
import { initGuardModel } from './guard.js';

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
        Guard
    } = models;

    // NOTE: Department table and mapping tables (user_role_map, role_permission_map)
    // were removed from guards-api. We keep models for compatibility but do NOT
    // define associations that would join against non-existent tables.

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
        Guard: initGuardModel(sequelize)
    };

    applyAssociations(models);

    return models;
}
