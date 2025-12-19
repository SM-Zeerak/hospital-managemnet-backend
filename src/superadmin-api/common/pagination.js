export function getPaginationParams(request) {
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 20;
    const offset = (page - 1) * limit;

    return {
        page,
        limit,
        offset
    };
}

export function createPaginationResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}

