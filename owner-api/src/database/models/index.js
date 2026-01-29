import { initOwnerUserModel } from './owner-user.js';
import { initTenantModel } from './tenant.js';
import { initPlanModel } from './plan.js';
import { initFeatureModel } from './feature.js';
import { initTenantFeatureModel } from './tenant-feature.js';
import { initVpsNodeModel } from './vps-node.js';
import { initProvisioningAuditModel } from './provisioning-audit.js';
import { initSubscriptionModel } from './subscription.js';
import { initTemplateModel } from './template.js';
import { initTemplateMetaModel } from './template-meta.js';
import { initTemplateAuditModel } from './template-audit.js';
import { initOwnerPasswordResetModel } from './owner-password-reset.js';
import { initOwnerSessionModel } from './owner-session.js';

function applyAssociations(models) {
    const {
        Tenant,
        Plan,
        Feature,
        TenantFeature,
        VpsNode,
        ProvisioningAudit,
        Subscription,
        Template,
        TemplateAudit,
        OwnerUser,
        OwnerPasswordReset,
        OwnerSession
    } = models;

    if (Plan && Tenant) {
        Plan.hasMany(Tenant, {
            as: 'tenants',
            foreignKey: 'planId'
        });

        Tenant.belongsTo(Plan, {
            as: 'plan',
            foreignKey: 'planId'
        });
    }

    if (Template && TemplateAudit) {
        Template.hasMany(TemplateAudit, {
            as: 'audits',
            foreignKey: 'templateId'
        });

        TemplateAudit.belongsTo(Template, {
            as: 'template',
            foreignKey: 'templateId'
        });
    }

    if (Tenant && TenantFeature) {
        Tenant.hasMany(TenantFeature, {
            as: 'features',
            foreignKey: 'tenantId'
        });

        TenantFeature.belongsTo(Tenant, {
            as: 'tenant',
            foreignKey: 'tenantId'
        });
    }

    if (Feature && TenantFeature) {
        Feature.hasMany(TenantFeature, {
            as: 'assignments',
            foreignKey: 'featureId'
        });

        TenantFeature.belongsTo(Feature, {
            as: 'feature',
            foreignKey: 'featureId'
        });
    }

    if (Tenant && ProvisioningAudit) {
        Tenant.hasMany(ProvisioningAudit, {
            as: 'provisioningEvents',
            foreignKey: 'tenantId'
        });

        ProvisioningAudit.belongsTo(Tenant, {
            as: 'tenant',
            foreignKey: 'tenantId'
        });
    }

    if (VpsNode && Tenant) {
        VpsNode.hasMany(Tenant, {
            as: 'tenants',
            foreignKey: 'vpsNodeId'
        });

        Tenant.belongsTo(VpsNode, {
            as: 'vpsNode',
            foreignKey: 'vpsNodeId'
        });
    }

    if (Tenant && Subscription) {
        Tenant.hasOne(Subscription, {
            as: 'subscription',
            foreignKey: 'tenantId'
        });

        Subscription.belongsTo(Tenant, {
            as: 'tenant',
            foreignKey: 'tenantId'
        });
    }

    if (Plan && Subscription) {
        Plan.hasMany(Subscription, {
            as: 'subscriptions',
            foreignKey: 'planId'
        });

        Subscription.belongsTo(Plan, {
            as: 'plan',
            foreignKey: 'planId'
        });
    }

    if (OwnerUser && OwnerPasswordReset) {
        OwnerUser.hasMany(OwnerPasswordReset, {
            as: 'passwordResets',
            foreignKey: 'ownerUserId'
        });

        OwnerPasswordReset.belongsTo(OwnerUser, {
            as: 'ownerUser',
            foreignKey: 'ownerUserId'
        });
    }

    if (OwnerUser && OwnerSession) {
        OwnerUser.hasMany(OwnerSession, {
            as: 'sessions',
            foreignKey: 'ownerUserId'
        });

        OwnerSession.belongsTo(OwnerUser, {
            as: 'ownerUser',
            foreignKey: 'ownerUserId'
        });
    }
}

export function initModels(sequelize) {
    const models = {
        OwnerUser: initOwnerUserModel(sequelize),
        Tenant: initTenantModel(sequelize),
        Plan: initPlanModel(sequelize),
        Feature: initFeatureModel(sequelize),
        TenantFeature: initTenantFeatureModel(sequelize),
        VpsNode: initVpsNodeModel(sequelize),
        ProvisioningAudit: initProvisioningAuditModel(sequelize),
        Subscription: initSubscriptionModel(sequelize),
        Template: initTemplateModel(sequelize),
        TemplateMeta: initTemplateMetaModel(sequelize),
        TemplateAudit: initTemplateAuditModel(sequelize),
        OwnerPasswordReset: initOwnerPasswordResetModel(sequelize),
        OwnerSession: initOwnerSessionModel(sequelize)
    };

    applyAssociations(models);

    return models;
}
