import {
    createListGuardsController,
    createCreateGuardController,
    createGetGuardController,
    createUpdateGuardController,
    createDeleteGuardController,
    createGetGuardsWhoCanAccessController,
    createAddGuardDocumentsController,
    createUpdateGuardDocumentController,
    createDeleteGuardDocumentController
} from './controller.js';

const guardResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
        tenantId: { type: 'string', format: 'uuid', nullable: true },
        guardId: { type: 'string' },
        dateOfRegistration: { type: 'string', nullable: true },
        name: { type: 'string' },
        imageUrl: { type: 'string', nullable: true, description: 'Profile image URL from Cloudinary' },
        imageCloudinaryPublicId: { type: 'string', nullable: true, description: 'Cloudinary public_id for delete API' },
        imageCloudinaryResourceType: { type: 'string', nullable: true, enum: ['image', 'raw', 'video', 'auto'], description: 'Resource type for Cloudinary delete' },
        documents: {
            type: 'array',
            nullable: true,
            description: 'Uploaded documents. Each has id (UUID) for update/delete, url, publicId (Cloudinary), documentDate/expireDate for expiry alerts.',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'Unique document id; use this to update or delete this specific document' },
                    url: { type: 'string' },
                    publicId: { type: 'string' },
                    resourceType: { type: 'string', enum: ['image', 'raw', 'video', 'auto'] },
                    documentDate: { type: 'string', nullable: true },
                    expireDate: { type: 'string', nullable: true },
                    name: { type: 'string', nullable: true }
                }
            }
        },
        fatherName: { type: 'string', nullable: true },
        dateOfBirth: { type: 'string', nullable: true },
        education: { type: 'string', nullable: true },
        cnic: { type: 'string', nullable: true },
        currentAddress: { type: 'string', nullable: true },
        permanentAddress: { type: 'string', nullable: true },
        contactNo1: { type: 'string', nullable: true },
        contactNo2: { type: 'string', nullable: true },
        salary: { type: ['number', 'string'], nullable: true },
        policeDistrictCurrent: { type: 'string', nullable: true },
        policeDistrictPermanent: { type: 'string', nullable: true },
        sameAddress: { type: 'boolean' },
        language: { type: 'string', nullable: true },
        married: { type: 'boolean' },
        emergencyContact: {
            type: 'object',
            nullable: true,
            properties: {
                name: { type: 'string' },
                contactNo: { type: 'string' },
                address: { type: 'string' },
                cnic: { type: 'string' }
            }
        },
        services: {
            type: 'object',
            nullable: true,
            properties: {
                type: { type: 'string' },
                unitNo: { type: 'string' },
                experienceYears: { type: 'string' }
            }
        },
        questions: {
            type: 'object',
            nullable: true,
            properties: {
                workedAsGuard: { type: 'boolean' },
                companyName: { type: 'string' },
                reasonOfLeaving: { type: 'string' },
                apssaTrained: { type: 'boolean' },
                workAnywhere: { type: 'boolean' },
                armyCourtCase: { type: 'boolean' }
            }
        },
        references: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    cnic: { type: 'string' },
                    contact: { type: 'string' },
                    relation: { type: 'string' }
                }
            }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

const guardExample = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tenantId: '660e8400-e29b-41d4-a716-446655440001',
    guardId: 'G001',
    dateOfRegistration: '2025-01-28',
    name: 'Ali Khan',
    fatherName: 'Rashid Khan',
    dateOfBirth: '1990-05-15',
    education: 'Intermediate',
    cnic: '35201-1234567-1',
    currentAddress: 'House 123, Lahore',
    permanentAddress: 'Village XYZ',
    contactNo1: '+92 300 1234567',
    contactNo2: '+92 321 7654321',
    salary: 35000,
    policeDistrictCurrent: 'Lahore Cantt',
    policeDistrictPermanent: 'District ABC',
    sameAddress: false,
    language: 'Urdu',
    married: true,
    emergencyContact: { name: 'Sara Khan', contactNo: '+92 321 0000000', address: 'Lahore', cnic: '' },
    services: { type: 'civilian', unitNo: 'U1', experienceYears: '2' },
    questions: { workedAsGuard: true, apssaTrained: true, armyCourtCase: false },
    references: [{ name: 'Referee One', address: 'Addr 1', contact: '0300-1111111', relation: 'Former employer' }],
    imageUrl: null,
    imageCloudinaryPublicId: null,
    documents: [{ url: 'https://res.cloudinary.com/...', publicId: 'guards/abc123', resourceType: 'raw', documentDate: '2025-01-01', expireDate: '2026-01-01', name: 'License' }],
    createdAt: '2025-01-28T10:00:00.000Z',
    updatedAt: '2025-01-28T10:00:00.000Z'
};

/** Request body for Create Guard (JSON). Required at API level: guardId, name, cnic (enforced in controller). No required here so multipart (empty body) passes. */
const createGuardBodySchema = {
    type: 'object',
    properties: {
        guardId: { type: 'string', description: 'Guard badge/registration ID (required)' },
        name: { type: 'string', description: 'Full name (required)' },
        cnic: { type: 'string', description: 'CNIC (required)' },
        dateOfRegistration: { type: 'string', description: 'YYYY-MM-DD' },
        fatherName: { type: 'string' },
        dateOfBirth: { type: 'string' },
        education: { type: 'string' },
        currentAddress: { type: 'string' },
        permanentAddress: { type: 'string' },
        contactNo1: { type: 'string' },
        contactNo2: { type: 'string' },
        salary: { type: 'number' },
        policeDistrictCurrent: { type: 'string' },
        policeDistrictPermanent: { type: 'string' },
        sameAddress: { type: 'boolean' },
        language: { type: 'string' },
        married: { type: 'boolean' },
        emergencyContact: {
            type: 'object',
            properties: { name: { type: 'string' }, contactNo: { type: 'string' }, address: { type: 'string' }, cnic: { type: 'string' } }
        },
        services: {
            type: 'object',
            properties: { type: { type: 'string' }, unitNo: { type: 'string' }, experienceYears: { type: 'string' } }
        },
        questions: {
            type: 'object',
            properties: {
                workedAsGuard: { type: 'boolean' },
                companyName: { type: 'string' },
                reasonOfLeaving: { type: 'string' },
                apssaTrained: { type: 'boolean' },
                workAnywhere: { type: 'boolean' },
                armyCourtCase: { type: 'boolean' }
            }
        },
        references: {
            type: 'array',
            items: {
                type: 'object',
                properties: { name: { type: 'string' }, address: { type: 'string' }, cnic: { type: 'string' }, contact: { type: 'string' }, relation: { type: 'string' } }
            }
        }
    }
};

/** Request body for Update Guard (JSON). Partial; all fields optional. */
const updateGuardBodySchema = {
    type: 'object',
    properties: createGuardBodySchema.properties
};

export function registerGuardRoutes(app) {
    const authGuard = app.authGuard;
    const requireRead = app.permissionGuard('guards.read');
    const requireCreate = app.permissionGuard('guards.create');
    const requireUpdate = app.permissionGuard('guards.update');
    const requireDelete = app.permissionGuard('guards.delete');

    app.get('/guards/guards', {
        schema: {
            tags: ['Guards'],
            summary: 'List guards',
            description: 'Get a list of guards with optional filters: guardId, name, cnic',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    guardId: { type: 'string', description: 'Filter by guard ID (partial match)' },
                    name: { type: 'string', description: 'Filter by name (partial match)' },
                    cnic: { type: 'string', description: 'Filter by CNIC (partial match)' },
                    limit: { type: 'string', pattern: '^\\d+$', description: 'Page size (default 50)' },
                    offset: { type: 'string', pattern: '^\\d+$', description: 'Pagination offset (default 0)' },
                    orderBy: { type: 'string', enum: ['createdAt', 'updatedAt', 'name', 'guardId', 'cnic'], description: 'Sort field (default createdAt)' },
                    orderDir: { type: 'string', enum: ['ASC', 'DESC'], description: 'Sort direction (default DESC)' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: guardResponseSchema
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                page: { type: 'number' },
                                limit: { type: 'number' },
                                total: { type: 'number' },
                                totalPages: { type: 'number' }
                            }
                        }
                    },
                    example: {
                        ok: true,
                        data: [guardExample],
                        meta: { page: 1, limit: 20, total: 1, totalPages: 1 }
                    }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createListGuardsController(app));

    app.get('/guards/guards/who-can-access', {
        schema: {
            tags: ['Guards'],
            summary: 'Who can access guards module',
            description: 'Returns which roles have which guards permissions (guards.read, guards.create, guards.update, guards.delete)',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                permissions: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            key: { type: 'string' },
                                            name: { type: 'string' }
                                        }
                                    }
                                },
                                roles: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', format: 'uuid' },
                                            name: { type: 'string' },
                                            description: { type: 'string', nullable: true },
                                            permissions: {
                                                type: 'array',
                                                items: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    example: {
                        ok: true,
                        data: {
                            permissions: [
                                { key: 'guards.read', name: 'View guards' },
                                { key: 'guards.create', name: 'Create guards' },
                                { key: 'guards.update', name: 'Update guards' },
                                { key: 'guards.delete', name: 'Delete guards' }
                            ],
                            roles: [
                                { id: 'uuid', name: 'admin', description: 'System Administrator', permissions: ['guards.read', 'guards.create', 'guards.update', 'guards.delete'] },
                                { id: 'uuid', name: 'cso', description: 'Chief Security Officer', permissions: ['guards.read', 'guards.create', 'guards.update', 'guards.delete'] }
                            ]
                        }
                    }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createGetGuardsWhoCanAccessController(app));

    /** For multipart requests, body is not parsed as JSON; set to {} so route body schema validation passes. */
    async function ensureBodyForValidation(request) {
        if (request.isMultipart && request.isMultipart() && (request.body === undefined || request.body === null)) {
            request.body = {};
        }
    }

    app.post('/guards/guards', {
        schema: {
            tags: ['Guards'],
            summary: 'Create guard',
            description: `Create a guard. Required: guardId, name, cnic. You can provide image and documents when creating.

**JSON body:** Guard object with guardId, name, cnic and optional fields. Do not send imageUrl/documents in JSON — use multipart for files.

**Multipart (create with image + documents):**
- \`data\`: (string) JSON string with guardId, name, cnic and other guard fields.
- \`image\`: (file) Profile image — uploaded to Cloudinary.
- \`document\` or \`documents\`: (file(s)) PDF/docs — uploaded to Cloudinary and saved in guard.documents.
- \`documentDate\`, \`expireDate\`: (string) Optional; applied to documents uploaded in this request.
- \`documentName\`: (string) Optional; saved as document \`name\` (e.g. "License", "ID copy").
For adding or updating documents on an existing guard, use the separate APIs: POST/PATCH/DELETE /guards/guards/:id/documents.`,
            security: [{ bearerAuth: [] }],
            body: createGuardBodySchema,
            response: {
                201: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        status: { type: 'number' },
                        data: guardResponseSchema
                    },
                    example: { ok: true, status: 201, data: guardExample }
                }
            }
        },
        preValidation: [ensureBodyForValidation],
        preHandler: [authGuard, requireCreate]
    }, createCreateGuardController(app));

    app.get('/guards/guards/:id', {
        schema: {
            tags: ['Guards'],
            summary: 'Get guard by ID',
            description: 'Get a single guard by ID',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: guardResponseSchema
                    },
                    example: { ok: true, data: guardExample }
                }
            }
        },
        preHandler: [authGuard, requireRead]
    }, createGetGuardController(app));

    app.patch('/guards/guards/:id', {
        schema: {
            tags: ['Guards'],
            summary: 'Update guard',
            description: `Update a guard. Send only fields to change.

**JSON body:** Partial guard object (guardId, name, cnic, imageUrl, documents, etc.).

**Multipart:** Same as Create — \`image\` only. To add/update documents use POST /guards/guards/:id/documents and PATCH /guards/guards/:id/documents.`,
            security: [{ bearerAuth: [] }],
            body: updateGuardBodySchema,
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        data: guardResponseSchema
                    },
                    example: { ok: true, data: guardExample }
                }
            }
        },
        preValidation: [ensureBodyForValidation],
        preHandler: [authGuard, requireUpdate]
    }, createUpdateGuardController(app));

    app.delete('/guards/guards/:id', {
        schema: {
            tags: ['Guards'],
            summary: 'Delete guard',
            description: 'Delete a guard record',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' }
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
                                id: { type: 'string', format: 'uuid' }
                            }
                        }
                    },
                    example: { ok: true, data: { id: '550e8400-e29b-41d4-a716-446655440000' } }
                }
            }
        },
        preHandler: [authGuard, requireDelete]
    }, createDeleteGuardController(app));

    // ——— Guard documents (separate from guard create/update) ———
    const ensureBodyForDocuments = async (request) => {
        if (request.isMultipart && request.isMultipart() && (request.body === undefined || request.body === null)) {
            request.body = {};
        }
    };

    app.post('/guards/guards/:id/documents', {
        schema: {
            tags: ['Guards'],
            summary: 'Add documents to guard',
            description: 'Upload one or more document files for a guard. Multipart: "document" or "documents" (files), optional "documentDate", "expireDate", "documentName" (saved as document name). Backend uploads to Cloudinary and appends to guard.documents.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string', format: 'uuid' } }
            },
            response: {
                200: {
                    type: 'object',
                    properties: { ok: { type: 'boolean' }, data: guardResponseSchema }
                }
            }
        },
        preValidation: [ensureBodyForDocuments],
        preHandler: [authGuard, requireUpdate]
    }, createAddGuardDocumentsController(app));

    app.patch('/guards/guards/:id/documents', {
        schema: {
            tags: ['Guards'],
            summary: 'Update guard document metadata',
            description: 'Update one document\'s metadata (documentDate, expireDate, name). Identify the document by id (recommended) or publicId. Body: { "id": "uuid" or "publicId": "...", "documentDate?", "expireDate?", "name?" }.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string', format: 'uuid' } }
            },
            body: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', description: 'Document id (from guard.documents[].id); use to update this specific document' },
                    publicId: { type: 'string', description: 'Alternative: Cloudinary publicId' },
                    documentDate: { type: 'string', nullable: true },
                    expireDate: { type: 'string', nullable: true },
                    name: { type: 'string', nullable: true }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: { ok: { type: 'boolean' }, data: guardResponseSchema }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, createUpdateGuardDocumentController(app));

    app.delete('/guards/guards/:id/documents', {
        schema: {
            tags: ['Guards'],
            summary: 'Remove document from guard',
            description: 'Remove one document by id (recommended) or publicId. Pass id or publicId in query (?id=uuid or ?publicId=...) or in JSON body. No body required when using query. Also deletes the file from Cloudinary.',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string', format: 'uuid' } }
            },
            querystring: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    publicId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: { ok: { type: 'boolean' }, data: guardResponseSchema }
                }
            }
        },
        preHandler: [authGuard, requireUpdate]
    }, createDeleteGuardDocumentController(app));
}

