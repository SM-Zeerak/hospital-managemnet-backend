import { z } from 'zod';

export const createVpsNodeSchema = z.object({
    name: z.string().min(1),
    region: z.string().min(1),
    ipAddress: z.string().min(1),
    capacity: z.number().int().nonnegative(),
    health: z.string().optional()
});

export const updateVpsNodeSchema = createVpsNodeSchema.partial();

export const idParamSchema = z.object({
    id: z.uuid()
});

export const capacityCheckSchema = z.object({
    tenants: z.number().int().nonnegative()
});
