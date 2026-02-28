import { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { buildPagination, formatPaginatedResult } from '../../common/pagination.js';

const GUARDS_PERMISSION_KEYS = ['guards.read', 'guards.create', 'guards.update', 'guards.delete'];

export async function listGuards(models, options = {}) {
    const { Guard } = models;
    const {
        tenantId,
        guardId,
        name,
        cnic,
        limit = 50,
        offset = 0,
        orderBy = 'createdAt',
        orderDir = 'DESC'
    } = options;

    const where = {};

    if (tenantId) {
        where.tenantId = tenantId;
    }

    if (guardId) {
        where.guardId = { [Op.iLike]: `%${guardId}%` };
    }

    if (name) {
        where.name = { [Op.iLike]: `%${name}%` };
    }

    if (cnic) {
        where.cnic = { [Op.iLike]: `%${cnic}%` };
    }

    const { limit: safeLimit, offset: safeOffset } = buildPagination({ page: 1, limit, offset });

    const result = await Guard.findAndCountAll({
        where,
        limit: safeLimit,
        offset: safeOffset,
        order: [[orderBy, orderDir]]
    });

    return formatPaginatedResult(
        { rows: result.rows.map(r => r.toJSON()), count: result.count },
        { page: 1, limit: safeLimit }
    );
}

export async function createGuard(models, payload, tenantId = null) {
    const { Guard } = models;
    const {
        imageUrl,
        imageCloudinaryPublicId,
        imageCloudinaryResourceType,
        documents = [],
        ...rest
    } = payload;
    const docsWithId = (Array.isArray(documents) ? documents : []).map((doc) => ({
        ...doc,
        id: doc.id && /^[0-9a-f-]{36}$/i.test(doc.id) ? doc.id : uuid()
    }));
    const record = await Guard.create({
        ...rest,
        tenantId: tenantId ?? payload.tenantId ?? null,
        imageUrl: imageUrl ?? null,
        imageCloudinaryPublicId: imageCloudinaryPublicId ?? null,
        imageCloudinaryResourceType: imageCloudinaryResourceType ?? null,
        documents: docsWithId
    });
    return record.toJSON();
}

export async function getGuardById(models, id, tenantId = null) {
    const { Guard } = models;
    const where = { id };
    if (tenantId) {
        where.tenantId = tenantId;
    }
    const record = await Guard.findOne({ where });
    if (!record) {
        return null;
    }
    return record.toJSON();
}

export async function updateGuard(models, id, changes, tenantId = null) {
    const { Guard } = models;
    const where = { id };
    if (tenantId) {
        where.tenantId = tenantId;
    }
    const record = await Guard.findOne({ where });
    if (!record) {
        return null;
    }
    const {
        imageUrl,
        imageCloudinaryPublicId,
        imageCloudinaryResourceType,
        documents,
        ...rest
    } = changes;
    const updatePayload = { ...rest };
    if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl;
    if (imageCloudinaryPublicId !== undefined) updatePayload.imageCloudinaryPublicId = imageCloudinaryPublicId;
    if (imageCloudinaryResourceType !== undefined) updatePayload.imageCloudinaryResourceType = imageCloudinaryResourceType;
    if (documents !== undefined) updatePayload.documents = Array.isArray(documents) ? documents : record.documents || [];
    await record.update(updatePayload);
    return record.toJSON();
}

export async function deleteGuard(models, id, tenantId = null) {
    const { Guard } = models;
    const where = { id };
    if (tenantId) {
        where.tenantId = tenantId;
    }
    const record = await Guard.findOne({ where });
    if (!record) {
        return null;
    }
    await record.destroy();
    return { id };
}

/**
 * Add document(s) to a guard. Each new entry gets a unique id (UUID) for later update/delete.
 * @param {Array<{ id?, url, publicId, resourceType?, documentDate?, expireDate?, name? }>} newDocuments
 */
export async function addGuardDocuments(models, guardId, newDocuments, tenantId = null) {
    const { Guard } = models;
    const where = { id: guardId };
    if (tenantId) where.tenantId = tenantId;
    const record = await Guard.findOne({ where });
    if (!record) return null;
    const current = Array.isArray(record.documents) ? record.documents : [];
    const withIds = newDocuments.map((doc) => ({
        ...doc,
        id: doc.id && /^[0-9a-f-]{36}$/i.test(doc.id) ? doc.id : uuid()
    }));
    const updated = [...current, ...withIds];
    await record.update({ documents: updated });
    return record.toJSON();
}

/**
 * Update one document in guard.documents by id (recommended) or publicId. Metadata only: documentDate, expireDate, name.
 */
export async function updateGuardDocument(models, guardId, documentIdOrPublicId, updates, tenantId = null) {
    const { Guard } = models;
    const where = { id: guardId };
    if (tenantId) where.tenantId = tenantId;
    const record = await Guard.findOne({ where });
    if (!record) return null;
    const docs = Array.isArray(record.documents) ? [...record.documents] : [];
    const byId = typeof documentIdOrPublicId === 'string' && /^[0-9a-f-]{36}$/i.test(documentIdOrPublicId);
    const idx = docs.findIndex((d) => d && (byId ? d.id === documentIdOrPublicId : d.publicId === documentIdOrPublicId));
    if (idx === -1) return null;
    if (updates.documentDate !== undefined) docs[idx].documentDate = updates.documentDate;
    if (updates.expireDate !== undefined) docs[idx].expireDate = updates.expireDate;
    if (updates.name !== undefined) docs[idx].name = updates.name;
    await record.update({ documents: docs });
    return record.toJSON();
}

/**
 * Remove one document from guard.documents by id (recommended) or publicId. Returns updated guard (with doc removed) for response; caller may delete from Cloudinary using doc.publicId.
 */
export async function deleteGuardDocument(models, guardId, documentIdOrPublicId, tenantId = null) {
    const { Guard } = models;
    const where = { id: guardId };
    if (tenantId) where.tenantId = tenantId;
    const record = await Guard.findOne({ where });
    if (!record) return null;
    const byId = typeof documentIdOrPublicId === 'string' && /^[0-9a-f-]{36}$/i.test(documentIdOrPublicId);
    const docs = Array.isArray(record.documents)
        ? record.documents.filter((d) => d && (byId ? d.id !== documentIdOrPublicId : d.publicId !== documentIdOrPublicId))
        : [];
    await record.update({ documents: docs });
    return record.toJSON();
}

/** Find one document in guard by id or publicId; returns { doc, resourceType } or null. */
export function findGuardDocument(guard, documentIdOrPublicId) {
    const docs = Array.isArray(guard.documents) ? guard.documents : [];
    const byId = typeof documentIdOrPublicId === 'string' && /^[0-9a-f-]{36}$/i.test(documentIdOrPublicId);
    const doc = docs.find((d) => d && (byId ? d.id === documentIdOrPublicId : d.publicId === documentIdOrPublicId));
    return doc ? { doc, resourceType: doc.resourceType || 'raw' } : null;
}

/**
 * Returns which roles have which guards permissions (for "who can access" this module).
 */
export async function getGuardsPermissionHolders(models) {
    const { Role, Permission, Guard } = models;
    const sequelize = Guard?.sequelize || Role?.sequelize;
    if (!sequelize) {
        return {
            permissions: GUARDS_PERMISSION_KEYS.map(key => ({ key, name: key })),
            roles: []
        };
    }

    const permissions = await Permission.findAll({
        where: { key: { [Op.in]: GUARDS_PERMISSION_KEYS } },
        attributes: ['id', 'key', 'name']
    });

    if (permissions.length === 0) {
        return {
            permissions: GUARDS_PERMISSION_KEYS.map(key => ({ key, name: key })),
            roles: []
        };
    }

    const permIdToKey = permissions.reduce((acc, p) => {
        acc[p.id] = { key: p.key, name: p.name };
        return acc;
    }, {});
    const permissionIds = permissions.map(p => p.id);

    const rolePermRows = await sequelize.query(
        'SELECT role_id, permission_id FROM role_permission_map WHERE permission_id IN (:permissionIds)',
        {
            replacements: { permissionIds },
            type: sequelize.QueryTypes.SELECT
        }
    );
    const rawRows = Array.isArray(rolePermRows) ? rolePermRows : [];

    const roleIds = [...new Set(rawRows.map(r => r.role_id))];
    const roles = await Role.findAll({
        where: { id: { [Op.in]: roleIds } },
        attributes: ['id', 'name', 'description']
    });

    const roleIdToPerms = {};
    for (const r of rawRows) {
        if (!roleIdToPerms[r.role_id]) roleIdToPerms[r.role_id] = [];
        if (permIdToKey[r.permission_id]) {
            roleIdToPerms[r.role_id].push(permIdToKey[r.permission_id].key);
        }
    }

    const rolesWithPermissions = roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || null,
        permissions: [...new Set(roleIdToPerms[role.id] || [])]
    }));

    return {
        permissions: permissions.map(p => ({ key: p.key, name: p.name })),
        roles: rolesWithPermissions
    };
}
