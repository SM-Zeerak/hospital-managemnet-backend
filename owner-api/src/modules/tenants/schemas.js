import { z } from 'zod';

export const listTenantsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.string().optional(),
    search: z.string().optional()
});

export const tenantIdParamSchema = z.object({
    id: z.uuid()
});

const baseTenantSchema = z.object({
    companyName: z.string().min(1),
    subdomain: z.string().min(1),
    tenantDbName: z.string().min(1),
    tenantRegion: z.string().min(1).optional(),
    planId: z.uuid().optional().nullable(),
    vpsNodeId: z.uuid().optional().nullable(),
    status: z.string().min(1).optional(),
    syncWebhookUrl: z.string().url().optional().nullable()
});

const firstAdminSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional()
});

export const createTenantSchema = baseTenantSchema.extend({
    firstAdmin: firstAdminSchema.optional()
});

export const updateTenantSchema = baseTenantSchema.partial();

export const createTenantUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    departmentId: z.uuid().optional().nullable(),
    roleIds: z.array(z.uuid()).optional().default([])
});

export const listTenantUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['active', 'suspended']).optional()
});
