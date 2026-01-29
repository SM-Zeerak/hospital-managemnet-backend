import {
    createOwnerUserSchema,
    updateOwnerUserSchema,
    idParamSchema
} from './schemas.js';
import {
    listOwnerUsers,
    createOwnerUser,
    findOwnerUserById,
    updateOwnerUser,
    deleteOwnerUser
} from './service.js';

export function createListOwnerUsersController(app) {
    return async function listController() {
        const users = await listOwnerUsers(app.db.models);
        return {
            ok: true,
            data: users
        };
    };
}

export function createCreateOwnerUserController(app) {
    return async function createController(request) {
        const payload = createOwnerUserSchema.parse(request.body);
        const user = await createOwnerUser(app.db.models, payload);
        return {
            ok: true,
            data: user
        };
    };
}

export function createGetOwnerUserController(app) {
    return async function getController(request) {
        const { id } = idParamSchema.parse(request.params);
        const user = await findOwnerUserById(app.db.models, id);
        if (!user) {
            throw app.httpErrors.notFound('Owner user not found');
        }

        return {
            ok: true,
            data: user
        };
    };
}

export function createUpdateOwnerUserController(app) {
    return async function updateController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updateOwnerUserSchema.parse(request.body);
        const user = await updateOwnerUser(app.db.models, id, payload);
        if (!user) {
            throw app.httpErrors.notFound('Owner user not found');
        }

        return {
            ok: true,
            data: user
        };
    };
}

export function createDeleteOwnerUserController(app) {
    return async function deleteController(request) {
        const { id } = idParamSchema.parse(request.params);
        const user = await deleteOwnerUser(app.db.models, id);
        if (!user) {
            throw app.httpErrors.notFound('Owner user not found');
        }

        return {
            ok: true,
            data: { id }
        };
    };
}
