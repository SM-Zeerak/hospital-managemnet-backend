import { z } from 'zod';

export const listAuditQuerySchema = z.object({
    tenantId: z.uuid().optional(),
    step: z.string().optional(),
    status: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const createAuditSchema = z.object({
    tenantId: z.uuid(),
    step: z.string().min(1),
    status: z.string().min(1),
    payload: z.record(z.any()).optional(),
    error: z.string().optional()
});
