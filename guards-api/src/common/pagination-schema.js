import { z } from 'zod';

/**
 * Common pagination query schema for list endpoints
 */
export const paginationQuerySchema = z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
    offset: z.string().regex(/^\d+$/).transform(Number).optional().default('0'),
    orderBy: z.string().optional(),
    orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC')
});

/**
 * Common search query schema
 */
export const searchQuerySchema = z.object({
    search: z.string().optional()
});

/**
 * Common date range query schema
 */
export const dateRangeQuerySchema = z.object({
    dateFrom: z.iso.datetime().optional(),
    dateTo: z.iso.datetime().optional()
});

/**
 * Common status filter schema
 */
export const statusFilterSchema = z.object({
    status: z.string().optional()
});

/**
 * Combine pagination with other common query params
 * Uses .extend() instead of deprecated .merge() for Zod v4 compatibility
 */
export function createListQuerySchema(additionalFields = {}) {
    return paginationQuerySchema
        .extend(searchQuerySchema.shape)
        .extend(dateRangeQuerySchema.shape)
        .extend(statusFilterSchema.shape)
        .extend(additionalFields);
}

