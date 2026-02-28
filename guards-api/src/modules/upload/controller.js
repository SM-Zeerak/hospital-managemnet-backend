import { uploadFile, deleteFile, isCloudinaryConfigured } from '../../utils/cloudinary.js';

/**
 * Upload any file (image, PDF, doc, etc.) to Cloudinary. Returns url + publicId + resourceType
 * so you can save them in your schema and delete later via DELETE /guards/files.
 */
export function createUploadFileController(app) {
    return async function uploadFileController(request) {
        if (!request.isMultipart || !request.isMultipart()) {
            throw app.httpErrors.badRequest('Send as multipart/form-data with a file field (e.g. "file").');
        }

        if (!isCloudinaryConfigured()) {
            throw app.httpErrors.notImplemented('File upload is not configured (set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
        }

        let buffer = null;
        let mimetype = '';
        let filename = '';
        let folder = 'uploads';
        let resourceTypeParam = '';

        const parts = request.parts();
        for await (const part of parts) {
            if (part.type === 'file') {
                buffer = await part.toBuffer();
                mimetype = part.mimetype || '';
                filename = part.filename || '';
            } else if (part.type === 'field') {
                if (part.fieldname === 'folder') folder = part.value || folder;
                else if (part.fieldname === 'resourceType') resourceTypeParam = part.value || '';
            }
        }

        if (!buffer || buffer.length === 0) {
            throw app.httpErrors.badRequest('No file in request. Send a file in multipart/form-data (e.g. field name "file").');
        }

        const result = await uploadFile(buffer, {
            folder,
            resourceType: resourceTypeParam || undefined,
            mimetype,
            filename: filename || undefined
        });

        if (!result) {
            throw app.httpErrors.internalServerError('Upload failed');
        }

        return {
            ok: true,
            data: {
                url: result.url,
                secureUrl: result.secureUrl,
                publicId: result.publicId,
                resourceType: result.resourceType
            }
        };
    };
}

/**
 * Delete a file from Cloudinary using the publicId (and optional resourceType) you saved when uploading.
 * Use this when you have stored publicId (and resourceType for non-image) from the upload response.
 */
export function createDeleteFileController(app) {
    return async function deleteFileController(request) {
        const body = request.body || {};
        const publicId = body.publicId ?? request.query?.publicId;
        if (!publicId || typeof publicId !== 'string') {
            throw app.httpErrors.badRequest('publicId is required (in body or query)');
        }

        if (!isCloudinaryConfigured()) {
            throw app.httpErrors.notImplemented('File delete is not configured (set CLOUDINARY_* env)');
        }

        const resourceType = body.resourceType ?? request.query?.resourceType ?? 'image';

        await deleteFile(publicId, { resourceType });

        return {
            ok: true,
            data: { deleted: true, publicId }
        };
    };
}

