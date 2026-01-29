import { z } from 'zod';

export const provisionTenantPathSchema = z.object({
    id: z.uuid()
});

export const provisionTenantBodySchema = z.object({
    force: z.boolean().optional()
});

export const provisioningStatusSchema = z.object({
    tenantId: z.uuid()
});
