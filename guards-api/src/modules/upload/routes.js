import { createUploadFileController, createDeleteFileController } from './controller.js';

export function registerUploadRoutes(app) {
    const authGuard = app.authGuard;

    app.post('/guards/upload', {
        schema: {
            tags: ['Upload'],
            summary: 'Upload any file to Cloudinary',
            description: 'Upload image, PDF, document, or any file. Returns url, publicId, and resourceType. Save publicId and resourceType in your schema to delete the file later via DELETE /guards/files.',
            consumes: ['multipart/form-data'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    file: { type: 'string', format: 'binary', description: 'File to upload' },
                    folder: { type: 'string', description: 'Cloudinary folder (default: uploads)' },
                    resourceType: { type: 'string', enum: ['image', 'raw', 'video', 'auto'], description: 'Optional; inferred from file if not set' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                url: { type: 'string', description: 'Public URL' },
                                secureUrl: { type: 'string', description: 'HTTPS URL' },
                                publicId: { type: 'string', description: 'Save this; use with DELETE /guards/files to remove the file' },
                                resourceType: { type: 'string', enum: ['image', 'raw', 'video'], description: 'Save this for non-image files when calling delete' }
                            }
                        }
                    }
                }
            }
        },
        preHandler: [authGuard]
    }, createUploadFileController(app));

    app.delete('/guards/files', {
        schema: {
            tags: ['Upload'],
            summary: 'Delete file from Cloudinary',
            description: 'Delete a file using the publicId (and resourceType for non-image) you saved when uploading.',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['publicId'],
                properties: {
                    publicId: { type: 'string', description: 'Cloudinary public_id from upload response' },
                    resourceType: { type: 'string', enum: ['image', 'raw', 'video'], default: 'image' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                deleted: { type: 'boolean' },
                                publicId: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        preHandler: [authGuard]
    }, createDeleteFileController(app));
}
