import { z } from 'zod';
import { paginationQuerySchema } from '../../common/pagination-schema.js';

const emergencyContactSchema = z.object({
    name: z.string().optional(),
    contactNo: z.string().optional(),
    address: z.string().optional(),
    cnic: z.string().optional()
});

const servicesSchema = z.object({
    type: z.string().optional(),
    unitNo: z.string().optional(),
    experienceYears: z.string().optional()
});

const questionsSchema = z.object({
    workedAsGuard: z.boolean().optional(),
    companyName: z.string().optional(),
    reasonOfLeaving: z.string().optional(),
    apssaTrained: z.boolean().optional(),
    workAnywhere: z.boolean().optional(),
    armyCourtCase: z.boolean().optional()
});

const referenceSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    cnic: z.string().optional(),
    contact: z.string().optional(),
    relation: z.string().optional()
});

/** One document stored in Cloudinary; id is our UUID for updating a specific document. */
const documentEntrySchema = z.object({
    id: z.string().uuid().optional(),
    url: z.string(),
    publicId: z.string(),
    resourceType: z.enum(['image', 'raw', 'video', 'auto']).optional().default('raw'),
    documentDate: z.string().optional(),
    expireDate: z.string().optional(),
    name: z.string().optional()
});

/** Optional string: allow undefined, null, or string (for PATCH partial updates). */
const optionalString = () => z.union([z.string(), z.null(), z.literal('')]).optional().transform(v => (v === '' || v == null ? undefined : v));

export const createGuardSchema = z.object({
    guardId: z.string().min(1, 'Guard ID is required'),
    dateOfRegistration: optionalString(),
    name: z.string().min(1, 'Name is required'),
    fatherName: optionalString(),
    dateOfBirth: optionalString(),
    education: optionalString(),
    cnic: z.string().min(1, 'CNIC is required'),
    currentAddress: optionalString(),
    permanentAddress: optionalString(),
    contactNo1: optionalString(),
    contactNo2: optionalString(),
    salary: z.union([z.number(), z.string(), z.null()]).optional().transform(v => (v === '' || v == null ? undefined : Number(v))),
    policeDistrictCurrent: optionalString(),
    policeDistrictPermanent: optionalString(),
    sameAddress: z.boolean().optional().default(false),
    language: optionalString(),
    married: z.boolean().optional().default(false),
    emergencyContact: emergencyContactSchema.optional().nullable(),
    services: servicesSchema.optional().nullable(),
    questions: questionsSchema.optional().nullable(),
    references: z.array(referenceSchema).optional().default([]),
    imageUrl: optionalString(),
    imageCloudinaryPublicId: optionalString(),
    imageCloudinaryResourceType: z.enum(['image', 'raw', 'video', 'auto']).optional().nullable(),
    documents: z.array(documentEntrySchema).optional().default([])
});

/** Update: all fields optional; only send fields you want to change. Nothing required. */
export const updateGuardSchema = createGuardSchema.partial().extend({
    guardId: z.string().min(1).optional().nullable(),
    name: z.string().min(1).optional().nullable(),
    cnic: z.string().min(1).optional().nullable()
});

export const idParamSchema = z.object({
    id: z.string().uuid()
});

export const listGuardsQuerySchema = paginationQuerySchema.extend({
    guardId: z.string().optional(),
    name: z.string().optional(),
    cnic: z.string().optional()
});

/** Body for PATCH /guards/guards/:id/documents. Identify document by id (recommended) or publicId. */
export const updateGuardDocumentSchema = z.object({
    id: z.string().uuid().optional(),
    publicId: z.string().min(1).optional(),
    documentDate: z.string().optional().nullable(),
    expireDate: z.string().optional().nullable(),
    name: z.string().optional().nullable()
}).refine((data) => (data.id && data.id.length > 0) || (data.publicId && data.publicId.length > 0), {
    message: 'Either id or publicId is required to identify the document'
});

/** Body or query for DELETE. Identify document by id (recommended) or publicId. */
export const deleteGuardDocumentSchema = z.object({
    id: z.string().uuid().optional(),
    publicId: z.string().min(1).optional()
}).refine((data) => (data.id && data.id.length > 0) || (data.publicId && data.publicId.length > 0), {
    message: 'Either id or publicId is required to identify the document'
});
