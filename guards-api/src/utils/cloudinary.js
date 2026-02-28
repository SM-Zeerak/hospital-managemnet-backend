import { v2 as cloudinary } from 'cloudinary';

const isConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

/** @typedef {'image'|'raw'|'video'|'auto'} ResourceType */

/**
 * Result from upload: url + keys needed to delete from Cloudinary later.
 * @typedef {Object} CloudinaryUploadResult
 * @property {string} url - Public URL (http)
 * @property {string} secureUrl - HTTPS URL
 * @property {string} publicId - Use with deleteFile() to remove from Cloudinary
 * @property {ResourceType} resourceType - Use with deleteFile() for non-image files
 */

/**
 * Infer resource_type from mimetype for upload.
 * @param {string} [mimetype]
 * @returns {ResourceType}
 */
export function getResourceTypeFromMime(mimetype) {
    if (!mimetype) return 'image';
    const m = mimetype.toLowerCase();
    if (m.startsWith('image/')) return 'image';
    if (m.startsWith('video/')) return 'video';
    return 'raw'; // pdf, doc, etc.
}

/**
 * Upload any file (image, PDF, doc, etc.) to Cloudinary.
 * Returns url + publicId + resourceType so you can save them and delete later via deleteFile().
 *
 * @param {Buffer} buffer - File buffer
 * @param {Object} [options]
 * @param {string} [options.folder='uploads'] - Cloudinary folder
 * @param {ResourceType} [options.resourceType] - 'image' | 'raw' | 'video' | 'auto'. Inferred from mimetype if not set.
 * @param {string} [options.mimetype] - Used to infer resourceType when options.resourceType is not set
 * @param {string} [options.filename] - Optional original filename (for raw uploads)
 * @returns {Promise<CloudinaryUploadResult|null>} Upload result with url, secureUrl, publicId, resourceType; null if Cloudinary not configured
 */
export async function uploadFile(buffer, options = {}) {
    if (!isConfigured) return null;

    const folder = options.folder ?? 'uploads';
    const resourceType = options.resourceType ?? getResourceTypeFromMime(options.mimetype);

    if (resourceType === 'image') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                        resourceType: 'image'
                    });
                }
            );
            uploadStream.end(buffer);
        });
    }

    // Raw or video: use upload with base64 data URI (SDK accepts this)
    const mime = options.mimetype || (resourceType === 'video' ? 'video/mp4' : 'application/octet-stream');
    const b64 = buffer.toString('base64');
    const dataUri = `data:${mime};base64,${b64}`;

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            dataUri,
            {
                folder,
                resource_type: resourceType,
                filename: options.filename
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    resourceType: result.resource_type || resourceType
                });
            }
        );
    });
}

/**
 * Delete a file from Cloudinary using the public_id (and optional resource_type) you saved when uploading.
 * Use this when you have stored publicId (and resourceType for non-image) from uploadFile().
 *
 * @param {string} publicId - Cloudinary public_id from upload result
 * @param {Object} [options]
 * @param {ResourceType} [options.resourceType='image'] - Must match what was used on upload for non-image files
 * @returns {Promise<Object|null>} Cloudinary delete result; null if Cloudinary not configured
 */
export async function deleteFile(publicId, options = {}) {
    if (!isConfigured) return null;

    const resourceType = options.resourceType ?? 'image';

    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

/**
 * Check if Cloudinary is configured (env vars set).
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
    return isConfigured;
}
