import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export async function uploadToCloudinary(buffer, folder = 'staff_images') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export async function deleteFromCloudinary(publicId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}
