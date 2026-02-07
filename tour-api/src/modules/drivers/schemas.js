
export const createDriverSchema = {
    tags: ['Drivers'],
    summary: 'Create driver',
    description: 'Create a new driver',
    body: {
        type: 'object',
        required: ['uid', 'driverId', 'name', 'email'],
        properties: {
            uid: { type: 'string', minLength: 1 },
            driverId: { type: 'string', minLength: 1 },
            name: { type: 'string', minLength: 1 },
            address: { type: 'string' },
            salary: { type: 'number' },
            status: { type: 'string', default: 'Active' },
            email: { type: 'string', format: 'email' },
            aqama: { type: 'string' },
            mobile: { type: 'string' },
            registrationDate: { type: 'string' },
            iqamaExpiry: { type: 'string' },
            experience: { type: 'string' },
            imageUrl: { type: 'string' }
        }
    }
};

export const updateDriverSchema = {
    tags: ['Drivers'],
    summary: 'Update driver',
    description: 'Update an existing driver',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    },
    body: {
        type: 'object',
        properties: {
            driverId: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            salary: { type: 'number' },
            status: { type: 'string' },
            email: { type: 'string', format: 'email' },
            aqama: { type: 'string' },
            mobile: { type: 'string' },
            registrationDate: { type: 'string' },
            iqamaExpiry: { type: 'string' },
            experience: { type: 'string' },
            imageUrl: { type: 'string' }
        }
    }
};

export const getDriverSchema = {
    tags: ['Drivers'],
    summary: 'Get driver',
    description: 'Get driver details by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' }
        }
    }
};

export const listDriversSchema = {
    tags: ['Drivers'],
    summary: 'List drivers',
    description: 'List drivers with pagination and search',
    querystring: {
        type: 'object',
        properties: {
            search: { type: 'string' },
            status: { type: 'string' },
            limit: { type: 'string' },
            offset: { type: 'string' },
            orderBy: { type: 'string' },
            orderDir: { type: 'string' }
        }
    }
};
