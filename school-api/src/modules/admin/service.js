import { Op } from 'sequelize';

function humanize(text) {
    return text
        .replace(/[_\-\.]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseTemplateContent(template) {
    if (!template) {
        throw new Error('Template not provided');
    }

    const raw = typeof template.content === 'string' ? template.content : JSON.stringify(template.content);
    try {
        return JSON.parse(raw);
    } catch (error) {
        throw new Error('Template content is not valid JSON');
    }
}

export async function getSubscription(models) {
    const record = await models.SubscriptionCache.findOne({
        order: [['syncedAt', 'DESC']]
    });
    return record;
}

export async function listFeatures(models, options = {}) {
    const where = {};
    if (typeof options.enabled === 'boolean') {
        where.enabled = options.enabled;
    }

    return models.FeatureCache.findAll({
        where,
        order: [['featureKey', 'ASC']]
    });
}

export async function getTemplateVersion(models) {
    const row = await models.TemplateVersionLocal?.findByPk(1);
    return row?.globalVersion ?? 0;
}

export async function applyRoleTemplate(models, options = {}) {
    const key = options.key || 'role-template.default';
    const overwrite = options.overwrite !== false;
    const template = await models.TemplateCache.findOne({
        where: { key }
    });

    if (!template) {
        const error = new Error('Template not found in cache');
        error.statusCode = 404;
        throw error;
    }

    if (template.type !== 'json') {
        const error = new Error('Template content is not JSON');
        error.statusCode = 400;
        throw error;
    }

    const payload = parseTemplateContent(template);
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    const permissions = Array.isArray(payload.permissions) ? payload.permissions : [];
    const rolePermissions = payload.rolePermissions || payload.role_permissions || {};

    const sequelize = models.Role.sequelize;
    if (!sequelize) {
        throw new Error('Sequelize instance not available on Role model');
    }

    const result = await sequelize.transaction(async (transaction) => {
        const permissionRecords = new Map();

        for (const permissionKey of permissions) {
            if (!permissionKey || typeof permissionKey !== 'string') {
                continue;
            }

            const [record] = await models.Permission.findOrCreate({
                where: { key: permissionKey },
                defaults: {
                    name: humanize(permissionKey),
                    description: null
                },
                transaction
            });
            permissionRecords.set(permissionKey, record);
        }

        const roleSummaries = [];

        for (const roleName of roles) {
            if (!roleName || typeof roleName !== 'string') {
                continue;
            }

            const [role] = await models.Role.findOrCreate({
                where: { name: roleName },
                defaults: {
                    description: humanize(roleName)
                },
                transaction
            });

            const desiredKeys = Array.isArray(rolePermissions[roleName])
                ? rolePermissions[roleName]
                : permissions;

            const desiredIds = desiredKeys
                .map((key) => permissionRecords.get(key)?.id)
                .filter(Boolean);

            if (overwrite) {
                await models.RolePermission.destroy({
                    where: {
                        roleId: role.id,
                        ...(desiredIds.length
                            ? { permissionId: { [Op.notIn]: desiredIds } }
                            : {})
                    },
                    transaction
                });
            }

            const existing = await models.RolePermission.findAll({
                where: { roleId: role.id },
                transaction
            });
            const existingIds = new Set(existing.map((row) => row.permissionId));

            const toInsert = desiredIds
                .filter((id) => !existingIds.has(id))
                .map((permissionId) => ({
                    roleId: role.id,
                    permissionId
                }));

            if (toInsert.length) {
                await models.RolePermission.bulkCreate(toInsert, { transaction });
            }

            roleSummaries.push({
                role: role.name,
                totalPermissions: desiredIds.length,
                grantedThisRun: toInsert.length
            });
        }

        if (models.TemplateVersionLocal) {
            const [local] = await models.TemplateVersionLocal.findOrCreate({
                where: { id: 1 },
                defaults: {
                    id: 1,
                    globalVersion: template.version ?? 0
                },
                transaction
            });

            if (template.version && local.globalVersion !== template.version) {
                await local.update({ globalVersion: template.version }, { transaction });
            }
        }

        return {
            templateKey: template.key,
            templateVersion: template.version,
            rolesProcessed: roleSummaries.length,
            roleSummaries
        };
    });

    return result;
}


