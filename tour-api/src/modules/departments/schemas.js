import { z } from 'zod';
import { createListQuerySchema } from '../../common/pagination-schema.js';

export const createDepartmentSchema = z.object({
    name: z.string().min(1).max(80),
    description: z.string().optional()
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const idParamSchema = z.object({
    id: z.uuid()
});

export const listDepartmentsQuerySchema = createListQuerySchema();
