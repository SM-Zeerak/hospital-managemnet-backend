import { z } from 'zod';
import { createListQuerySchema } from '../../common/pagination-schema.js';

export const createPermissionSchema = z.object({
    key: z.string().min(1).max(120),
    name: z.string().min(1).max(150),
    description: z.string().optional()
});

export const updatePermissionSchema = createPermissionSchema.partial();

export const idParamSchema = z.object({
    id: z.uuid()
});

export const listPermissionsQuerySchema = createListQuerySchema();
