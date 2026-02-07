export function buildPagination({ page = 1, limit = 20 }) {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 20;
    const offset = (safePage - 1) * safeLimit;
    return { page: safePage, limit: safeLimit, offset };
}

export function formatPaginatedResult({ rows, count }, { page, limit }) {
    return {
        data: rows,
        meta: {
            page,
            limit,
            total: count,
            totalPages: Math.max(Math.ceil(count / limit), 1)
        }
    };
}
