import { z } from 'zod';
import { createListQuerySchema } from '../../common/pagination-schema.js';

export const createRoomSchema = z.object({
    name: z.string().min(1).max(120),
    status: z.enum(['active', 'inactive']).default('active'),
    bedIds: z.array(z.string().uuid()).optional()
});

export const updateRoomSchema = createRoomSchema.partial();

export const idParamSchema = z.object({
    id: z.string().uuid()
});

export const listRoomsQuerySchema = createListQuerySchema().extend({
    status: z.enum(['active', 'inactive']).optional()
});
