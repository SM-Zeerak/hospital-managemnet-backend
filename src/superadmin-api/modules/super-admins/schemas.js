import { z } from 'zod';
import { commonSchemas } from '../../../middleware/security.js';

export const createSuperAdminSchema = z.object({
    body: z.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
        role: z.enum(['super-admin', 'admin']).default('super-admin').optional(),
        isActive: z.boolean().default(true).optional()
    })
});

export const updateSuperAdminSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID format')
    }),
    body: z.object({
        email: commonSchemas.email.optional(),
        name: z.string().min(1).max(255).optional(),
        role: z.enum(['super-admin', 'admin']).optional(),
        isActive: z.boolean().optional()
    })
});

export const deleteSuperAdminSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID format')
    })
});

export const getSuperAdminSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid ID format')
    })
});

export const listSuperAdminsSchema = z.object({
    query: commonSchemas.pagination
});

