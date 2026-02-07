import { z } from 'zod';
import { createListQuerySchema } from '../../common/pagination-schema.js';

const bedBaseSchema = z.object({
    name: z.string().min(1).max(120),
    quality: z.string().max(50).optional().nullable(),
    status: z.enum(['active', 'maintenance', 'inactive']),
    rate: z.number().nonnegative(),
    roomId: z.string().uuid().optional().nullable()
});

export const createBedSchema = bedBaseSchema.extend({
    status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
    rate: z.number().nonnegative().default(0)
});

export const updateBedSchema = bedBaseSchema.partial();

export const idParamSchema = z.object({
    id: z.string().uuid()
});

export const listBedsQuerySchema = createListQuerySchema().extend({
    roomId: z.string().uuid().optional(),
    status: z.enum(['active', 'maintenance', 'inactive']).optional(),
    available: z.string().optional(),
    quality: z.string().optional()
});
