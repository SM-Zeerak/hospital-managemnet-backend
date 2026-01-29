import { z } from 'zod';

export const createOwnerUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(['super-admin', 'admin']),
    isActive: z.boolean().optional()
});

export const updateOwnerUserSchema = z.object({
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['super-admin', 'admin']).optional(),
    isActive: z.boolean().optional()
});

export const idParamSchema = z.object({
    id: z.uuid()
});
