import {
    createGuardSchema,
    updateGuardSchema,
    idParamSchema,
    listGuardsQuerySchema,
    updateGuardDocumentSchema,
    deleteGuardDocumentSchema
} from './schemas.js';
import {
    listGuards,
    createGuard,
    getGuardById,
    updateGuard,
    deleteGuard,
    getGuardsPermissionHolders,
    addGuardDocuments,
    updateGuardDocument,
    deleteGuardDocument,
    findGuardDocument
} from './service.js';
import { v4 as uuid } from 'uuid';
import { uploadFile, deleteFile, getResourceTypeFromMime } from '../../utils/cloudinary.js';

export function createGetGuardsWhoCanAccessController(app) {
    return async function getGuardsWhoCanAccessController(request) {
        const data = await getGuardsPermissionHolders(app.db.models);
        return {
            ok: true,
            data
        };
    };
}

export function createListGuardsController(app) {
    return async function listGuardsController(request) {
        const query = listGuardsQuerySchema.parse(request.query);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const result = await listGuards(app.db.models, { ...query, tenantId });
        return {
            ok: true,
            ...result
        };
    };
}

/**
 * Parse multipart for guard update only: "data" (JSON), "image" (file). No documents — use POST /guards/guards/:id/documents to add.
 */
async function parseMultipartGuardBody(request, app) {
    const raw = {};
    let dataJson = null;
    const fileParts = [];
    const parts = request.parts();
    for await (const part of parts) {
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            fileParts.push({ fieldname: part.fieldname, buffer, mimetype: part.mimetype, filename: part.filename });
            continue;
        }
        if (part.type === 'field' && part.fieldname) {
            if (part.fieldname === 'data') {
                try {
                    dataJson = JSON.parse(part.value);
                } catch {
                    throw app.httpErrors.badRequest('Invalid JSON in "data" field');
                }
                continue;
            }
            raw[part.fieldname] = part.value;
        }
    }
    const parsed = dataJson !== null ? dataJson : (Object.keys(raw).length ? raw : null);

    let imageResult = null;
    for (const part of fileParts) {
        if (part.fieldname !== 'image') continue;
        const resourceType = getResourceTypeFromMime(part.mimetype);
        try {
            const result = await uploadFile(part.buffer, {
                folder: 'guards',
                resourceType,
                mimetype: part.mimetype,
                filename: part.filename
            });
            if (result) imageResult = result;
        } catch (err) {
            app.log?.warn?.(err, 'Cloudinary upload failed');
        }
    }
    return { parsed, imageResult };
}

/**
 * Parse multipart for guard create: "data" (JSON), "image" (file), "document"/"documents" (files), documentDate, expireDate.
 * When creating a guard you can provide documents; when updating, use POST /guards/guards/:id/documents instead.
 */
async function parseMultipartGuardBodyForCreate(request, app) {
    const raw = {};
    let dataJson = null;
    let documentDate = null;
    let expireDate = null;
    let documentName = null;
    const fileParts = [];
    const parts = request.parts();
    for await (const part of parts) {
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            fileParts.push({ fieldname: part.fieldname, buffer, mimetype: part.mimetype, filename: part.filename });
            continue;
        }
        if (part.type === 'field' && part.fieldname) {
            if (part.fieldname === 'data') {
                try {
                    dataJson = JSON.parse(part.value);
                } catch {
                    throw app.httpErrors.badRequest('Invalid JSON in "data" field');
                }
                continue;
            }
            if (part.fieldname === 'documentDate') documentDate = part.value || null;
            else if (part.fieldname === 'expireDate') expireDate = part.value || null;
            else if (part.fieldname === 'documentName' || part.fieldname === 'name') documentName = part.value?.trim() || null;
            else raw[part.fieldname] = part.value;
        }
    }
    const parsed = dataJson !== null ? dataJson : (Object.keys(raw).length ? raw : null);

    let imageResult = null;
    const documentResults = [];
    for (const part of fileParts) {
        const resourceType = getResourceTypeFromMime(part.mimetype);
        try {
            const result = await uploadFile(part.buffer, {
                folder: 'guards',
                resourceType,
                mimetype: part.mimetype,
                filename: part.filename
            });
            if (result) {
                if (part.fieldname === 'image') {
                    imageResult = result;
                } else if (part.fieldname === 'document' || part.fieldname === 'documents') {
                    documentResults.push({
                        id: uuid(),
                        url: result.url,
                        publicId: result.publicId,
                        resourceType: result.resourceType || 'raw',
                        documentDate: documentDate || undefined,
                        expireDate: expireDate || undefined,
                        name: documentName || undefined
                    });
                }
            }
        } catch (err) {
            app.log?.warn?.(err, 'Cloudinary upload failed');
        }
    }
    return { parsed, imageResult, documentResults };
}

export function createCreateGuardController(app) {
    return async function createGuardController(request) {
        let payload;
        if (request.isMultipart && request.isMultipart()) {
            const { parsed, imageResult, documentResults } = await parseMultipartGuardBodyForCreate(request, app);
            if (!parsed || (typeof parsed !== 'object')) {
                throw app.httpErrors.badRequest('Missing form field "data" (JSON) with guardId, name, cnic');
            }
            payload = { ...parsed };
            if (imageResult) {
                payload.imageUrl = imageResult.url;
                payload.imageCloudinaryPublicId = imageResult.publicId;
                payload.imageCloudinaryResourceType = imageResult.resourceType || 'image';
            }
            if (documentResults.length > 0) {
                const existing = Array.isArray(payload.documents) ? payload.documents : [];
                payload.documents = [...existing, ...documentResults];
            }
            payload = createGuardSchema.parse(payload);
        } else {
            payload = createGuardSchema.parse(request.body || {});
        }
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const guard = await createGuard(app.db.models, payload, tenantId);
        return {
            ok: true,
            status: 201,
            data: guard
        };
    };
}

export function createGetGuardController(app) {
    return async function getGuardController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const guard = await getGuardById(app.db.models, id, tenantId);
        if (!guard) {
            throw app.httpErrors.notFound('Guard not found');
        }
        return {
            ok: true,
            data: guard
        };
    };
}

export function createUpdateGuardController(app) {
    return async function updateGuardController(request) {
        const { id } = idParamSchema.parse(request.params);
        let payload;
        if (request.isMultipart && request.isMultipart()) {
            const { parsed, imageResult } = await parseMultipartGuardBody(request, app);
            if (!parsed || (typeof parsed !== 'object')) {
                throw app.httpErrors.badRequest('Missing form field "data" (JSON) for guard update');
            }
            payload = { ...parsed };
            if (imageResult) {
                payload.imageUrl = imageResult.url;
                payload.imageCloudinaryPublicId = imageResult.publicId;
                payload.imageCloudinaryResourceType = imageResult.resourceType || 'image';
            }
            payload = updateGuardSchema.parse(payload);
        } else {
            payload = updateGuardSchema.parse(request.body || {});
        }
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const guard = await updateGuard(app.db.models, id, payload, tenantId);
        if (!guard) {
            throw app.httpErrors.notFound('Guard not found');
        }
        return {
            ok: true,
            data: guard
        };
    };
}

export function createDeleteGuardController(app) {
    return async function deleteGuardController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const result = await deleteGuard(app.db.models, id, tenantId);
        if (!result) {
            throw app.httpErrors.notFound('Guard not found');
        }
        return {
            ok: true,
            data: result
        };
    };
}

/**
 * Parse multipart for document add: "document"/"documents" (files), optional documentDate, expireDate, documentName.
 */
async function parseMultipartDocumentBody(request, app) {
    let documentDate = null;
    let expireDate = null;
    let documentName = null;
    const fileParts = [];
    const parts = request.parts();
    for await (const part of parts) {
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            fileParts.push({ fieldname: part.fieldname, buffer, mimetype: part.mimetype, filename: part.filename });
            continue;
        }
        if (part.type === 'field' && part.fieldname) {
            if (part.fieldname === 'documentDate') documentDate = part.value || null;
            else if (part.fieldname === 'expireDate') expireDate = part.value || null;
            else if (part.fieldname === 'documentName' || part.fieldname === 'name') documentName = part.value?.trim() || null;
        }
    }
    const documentResults = [];
    for (const part of fileParts) {
        if (part.fieldname !== 'document' && part.fieldname !== 'documents') continue;
        const resourceType = getResourceTypeFromMime(part.mimetype);
        try {
            const result = await uploadFile(part.buffer, {
                folder: 'guards',
                resourceType,
                mimetype: part.mimetype,
                filename: part.filename
            });
            if (result) {
                documentResults.push({
                    id: uuid(),
                    url: result.url,
                    publicId: result.publicId,
                    resourceType: result.resourceType || 'raw',
                    documentDate: documentDate || undefined,
                    expireDate: expireDate || undefined,
                    name: documentName || undefined
                });
            }
        } catch (err) {
            app.log?.warn?.(err, 'Cloudinary upload failed');
        }
    }
    return { documentResults };
}

export function createAddGuardDocumentsController(app) {
    return async function addGuardDocumentsController(request) {
        const { id } = idParamSchema.parse(request.params);
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const guard = await getGuardById(app.db.models, id, tenantId);
        if (!guard) throw app.httpErrors.notFound('Guard not found');

        const { documentResults } = await parseMultipartDocumentBody(request, app);
        if (documentResults.length === 0) {
            throw app.httpErrors.badRequest('At least one document file is required (field: document or documents)');
        }
        const updated = await addGuardDocuments(app.db.models, id, documentResults, tenantId);
        return { ok: true, data: updated };
    };
}

export function createUpdateGuardDocumentController(app) {
    return async function updateGuardDocumentController(request) {
        const { id: guardId } = idParamSchema.parse(request.params);
        const body = updateGuardDocumentSchema.parse(request.body || {});
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const documentIdOrPublicId = body.id ?? body.publicId;
        const updated = await updateGuardDocument(app.db.models, guardId, documentIdOrPublicId, {
            documentDate: body.documentDate,
            expireDate: body.expireDate,
            name: body.name
        }, tenantId);
        if (!updated) throw app.httpErrors.notFound('Guard or document not found');
        return { ok: true, data: updated };
    };
}

export function createDeleteGuardDocumentController(app) {
    return async function deleteGuardDocumentController(request) {
        const { id: guardId } = idParamSchema.parse(request.params);
        const body = request.body && typeof request.body === 'object' ? request.body : {};
        const query = request.query || {};
        const id = (body.id ?? query.id ?? '').trim() || undefined;
        const publicId = (body.publicId ?? query.publicId ?? '').trim() || undefined;
        const parsed = deleteGuardDocumentSchema.parse({ id, publicId });
        const tenantId = request.user?.tenantId || process.env.TENANT_ID || null;
        const guard = await getGuardById(app.db.models, guardId, tenantId);
        if (!guard) throw app.httpErrors.notFound('Guard not found');
        const documentIdOrPublicId = parsed.id ?? parsed.publicId;
        const found = findGuardDocument(guard, documentIdOrPublicId);
        if (!found) throw app.httpErrors.notFound('Document not found');
        const updated = await deleteGuardDocument(app.db.models, guardId, documentIdOrPublicId, tenantId);
        if (!updated) throw app.httpErrors.notFound('Document not found');
        try {
            await deleteFile(found.doc.publicId, { resourceType: found.resourceType });
        } catch (err) {
            app.log?.warn?.(err, 'Cloudinary delete failed');
        }
        return { ok: true, data: updated };
    };
}
