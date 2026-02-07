import { z } from 'zod';

function toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lowered = value.toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(lowered)) return true;
        if (['false', '0', 'no', 'off'].includes(lowered)) return false;
    }
    return undefined;
}

export const featureQuerySchema = z
    .object({
        enabled: z
            .union([z.boolean(), z.string()])
            .optional()
            .transform(toBoolean)
    })
    .partial();

export const applyTemplateSchema = z.object({
    key: z.string().min(3).optional(),
    overwrite: z.boolean().optional().default(true)
});


