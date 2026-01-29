import { Op } from 'sequelize';
import { notifyTenantSync } from '../tenants/service.js';
import { computeTemplateDiff, recordTemplateAudit } from './service.js';

function resolveTriggeredBy(user) {
    if (!user) {
        return null;
    }

    return user.email || user.id || null;
}

async function notifyTenants(app, eventName, triggeredBy, logger) {
    const { Tenant } = app.db.models;
    const tenants = await Tenant.findAll({
        attributes: ['id', 'companyName', 'status', 'syncWebhookUrl'],
        where: {
            syncWebhookUrl: { [Op.ne]: null },
            status: { [Op.in]: ['active', 'provisioning'] }
        }
    });

    if (!tenants.length) {
        logger.debug('No tenants configured for sync notifications');
        return;
    }

    await Promise.allSettled(
        tenants.map((tenant) =>
            notifyTenantSync(app, tenant.id, {
                reason: eventName,
                triggeredBy: triggeredBy || 'owner-system'
            }).then((result) => {
                if (!result.ok) {
                    logger.warn(
                        {
                            tenantId: tenant.id,
                            status: result.status,
                            message: result.message
                        },
                        'Tenant sync webhook returned failure'
                    );
                }
            })
        )
    );
}

export function scheduleTemplateChangeDispatch(app, eventName, template, options = {}) {
    const logger = app.log.child({
        module: 'template-events',
        eventName,
        templateId: template?.id ?? null
    });

    const triggeredBy = options.triggeredBy ?? resolveTriggeredBy(options.user);
    const previous = options.previous ?? null;
    const version =
        options.version ??
        template?.version ??
        (previous && previous.version !== undefined ? previous.version : null);

    const diff = options.diff ?? computeTemplateDiff(previous, template);

    const emitPayload = {
        event: eventName,
        templateId: template?.id ?? null,
        version,
        changedFields: diff.changedFields,
        triggeredBy,
        timestamp: new Date().toISOString()
    };

    const job = async () => {
        await recordTemplateAudit(app.db.models, {
            templateId: template?.id,
            version,
            changeType: eventName,
            diff,
            triggeredBy
        });

        if (app.ownerIO) {
            app.ownerIO.emit('templates.changed', {
                ...emitPayload,
                preview: diff.after
            });
        }

        if (options.notifyTenants !== false) {
            await notifyTenants(app, eventName, triggeredBy, logger);
        }
    };

    setImmediate(() => {
        job()
            .then(() => {
                logger.info('Template change dispatch completed');
            })
            .catch((error) => {
                logger.error({ err: error }, 'Template change dispatch failed');
            });
    });
}


