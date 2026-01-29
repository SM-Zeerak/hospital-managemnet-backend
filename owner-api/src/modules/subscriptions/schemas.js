import { z } from 'zod';

export const upsertSubscriptionSchema = z.object({
    planId: z.uuid().optional().nullable(),
    status: z.string().min(1),
    startAt: z.iso.datetime().optional(),
    endAt: z.iso.datetime().optional(),
    nextBillingAt: z.iso.datetime().optional()
});
