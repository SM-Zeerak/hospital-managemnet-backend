import { z } from 'zod';

export const createFeatureSchema = z.object({
    key: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    defaultEnabled: z.boolean().optional()
});

export const updateFeatureSchema = createFeatureSchema.partial();

export const featureIdParamSchema = z.object({
    id: z.uuid()
});

export const tenantIdParamSchema = z.object({
    tenantId: z.uuid()
});

export const upsertTenantFeaturesSchema = z.object({
    features: z.array(z.object({
        featureId: z.uuid(),
        enabled: z.boolean(),
        valueJson: z.record(z.string(), z.any()).optional()
    })).min(1)
});
