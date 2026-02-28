import { z } from 'zod';
import { createListQuerySchema } from '../../common/pagination-schema.js';

export const createRoleSchema = z.object({
    name: z.string().min(1).max(80),
    description: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    permissionIds: z.array(z.uuid()).default([])
});

export const updateRoleSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    description: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    permissionIds: z.array(z.uuid()).optional()
});

export const idParamSchema = z.object({
    id: z.uuid()
});

export const listRolesQuerySchema = createListQuerySchema({
    departmentId: z.string().uuid().optional()
});
