import { z } from 'zod';

export const createPlanSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    limits: z.record(z.string(), z.any()).default({}),
    isActive: z.boolean().optional()
});

export const updatePlanSchema = createPlanSchema.partial();

export const planIdParamSchema = z.object({
    id: z.uuid()
});
