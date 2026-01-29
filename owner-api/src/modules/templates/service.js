import { Op } from 'sequelize';

async function touchGlobalVersion(models) {
    const { TemplateMeta } = models;
    const [meta] = await TemplateMeta.findOrCreate({
        where: { id: 1 },
        defaults: {
            id: 1,
            globalVersion: 1
        }
    });

    const next = meta.globalVersion + 1;
    await meta.update({ globalVersion: next });
    return next;
}

export async function getGlobalTemplateVersion(models) {
    const { TemplateMeta } = models;
    const meta = await TemplateMeta.findByPk(1);
    return meta?.globalVersion ?? 1;
}

export async function listTemplates(models, filters = {}) {
    const { Template } = models;
    const where = {};

    if (filters.type) {
        where.type = filters.type;
    }

    if (typeof filters.isActive === 'boolean') {
        where.isActive = filters.isActive;
    }

    return Template.findAll({
        where,
        order: [['updatedAt', 'DESC']]
    });
}

export async function listTemplatesNewerThan(models, version) {
    const { Template } = models;
    const where = {};
    if (typeof version === 'number') {
        where.version = { [Op.gt]: version };
    }

    return Template.findAll({
        where,
        order: [['version', 'ASC']]
    });
}

const trackedFields = ['key', 'name', 'type', 'description', 'content', 'metadata', 'isActive', 'version'];

function snapshotTemplate(template) {
    if (!template) {
        return null;
    }

    const plain = typeof template.toJSON === 'function' ? template.toJSON() : template;
    return trackedFields.reduce((acc, field) => {
        if (plain[field] !== undefined) {
            acc[field] = plain[field];
        }

        return acc;
    }, {});
}

function valuesEqual(left, right) {
    if (left === right) {
        return true;
    }

    if (left === null || right === null) {
        return left === right;
    }

    if (typeof left === 'object' && typeof right === 'object') {
        try {
            return JSON.stringify(left) === JSON.stringify(right);
        } catch (error) {
            return false;
        }
    }

    return false;
}

export function computeTemplateDiff(before, after) {
    const beforeSnapshot = snapshotTemplate(before);
    const afterSnapshot = snapshotTemplate(after);
    const changedFields = trackedFields.filter((field) => {
        const previousValue = beforeSnapshot ? beforeSnapshot[field] : undefined;
        const nextValue = afterSnapshot ? afterSnapshot[field] : undefined;
        return !valuesEqual(previousValue, nextValue);
    });

    return {
        before: beforeSnapshot,
        after: afterSnapshot,
        changedFields
    };
}

export async function createTemplate(models, payload) {
    const { Template } = models;
    const template = await Template.create({
        ...payload,
        metadata: payload.metadata ?? {},
        version: payload.version ?? 1
    });

    const version = await touchGlobalVersion(models);
    await template.update({ version });
    return template;
}

export function findTemplateById(models, id) {
    const { Template } = models;
    return Template.findByPk(id);
}

export async function updateTemplate(models, id, changes) {
    const template = await findTemplateById(models, id);
    if (!template) {
        return null;
    }

    if (changes.metadata === undefined) {
        // Avoid accidentally nulling metadata when not provided
        delete changes.metadata;
    }

    const version = await touchGlobalVersion(models);
    await template.update({
        ...changes,
        version
    });
    return template;
}

export async function archiveTemplate(models, id) {
    const template = await findTemplateById(models, id);
    if (!template) {
        return null;
    }

    const version = await touchGlobalVersion(models);
    await template.update({ isActive: false, version });
    return template;
}

export async function bumpGlobalTemplateVersion(models) {
    return touchGlobalVersion(models);
}

export function recordTemplateAudit(models, payload) {
    const { TemplateAudit } = models;
    if (!TemplateAudit) {
        throw new Error('TemplateAudit model not initialised');
    }

    return TemplateAudit.create({
        templateId: payload.templateId ?? null,
        version: payload.version ?? null,
        changeType: payload.changeType,
        diff: payload.diff ?? {},
        triggeredBy: payload.triggeredBy ?? null
    });
}

export function listTemplateAudits(models, options = {}) {
    const { TemplateAudit, Template } = models;
    if (!TemplateAudit) {
        throw new Error('TemplateAudit model not initialised');
    }

    const where = {};
    if (typeof options.since === 'number') {
        where.version = { [Op.gt]: options.since };
    }

    const queryOptions = {
        where,
        order: [['createdAt', 'ASC']],
        include: [
            {
                model: Template,
                as: 'template',
                attributes: ['id', 'key', 'name', 'type', 'version', 'isActive']
            }
        ]
    };

    if (typeof options.limit === 'number' && options.limit > 0) {
        queryOptions.limit = Math.min(options.limit, 200);
    } else {
        queryOptions.limit = 200;
    }

    return TemplateAudit.findAll(queryOptions);
}
