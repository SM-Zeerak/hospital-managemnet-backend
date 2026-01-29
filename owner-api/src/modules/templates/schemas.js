import { z } from 'zod';

export const listQuerySchema = z.object({
    type: z.string().optional(),
    isActive: z
        .string()
        .optional()
        .transform((value) => {
            if (value === undefined) return undefined;
            return ['true', '1', 'on'].includes(value.toLowerCase());
        })
});

export const templateParamsSchema = z.object({
    id: z.uuid()
});

export const createTemplateSchema = z.object({
    key: z.string().min(3).max(120),
    name: z.string().min(1).max(150),
    type: z.string().max(60).default('email'),
    description: z.string().optional(),
    content: z.string().min(1),
    metadata: z.record(z.any()).optional()
});

export const updateTemplateSchema = createTemplateSchema.partial();

function toNumberOrUndefined(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return undefined;
    }

    return numeric;
}

export const diffQuerySchema = z
    .object({
        since: z
            .union([z.string(), z.number()])
            .optional()
            .transform(toNumberOrUndefined),
        limit: z
            .union([z.string(), z.number()])
            .optional()
            .transform(toNumberOrUndefined),
        full: z
            .union([z.string(), z.boolean()])
            .optional()
            .transform((value) => {
                if (typeof value === 'boolean') {
                    return value;
                }
                if (typeof value === 'string') {
                    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
                }
                return false;
            })
    })
    .partial();
