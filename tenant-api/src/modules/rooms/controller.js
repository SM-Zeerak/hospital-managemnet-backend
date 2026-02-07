import {
    createRoomSchema,
    updateRoomSchema,
    idParamSchema,
    listRoomsQuerySchema
} from './schemas.js';
import {
    listRooms,
    createRoom,
    findRoomById,
    updateRoom,
    deleteRoom
} from './service.js';

export function createListRoomsController(app) {
    return async function listRoomsController(request) {
        const query = listRoomsQuerySchema.parse(request.query);
        const result = await listRooms(app.db.models, query);
        return {
            ok: true,
            status: 200,
            invokedMethod: 'List Rooms',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            ...result
        };
    };
}

export function createCreateRoomController(app) {
    return async function createRoomController(request) {
        const payload = createRoomSchema.parse(request.body);
        const room = await createRoom(app.db.models, payload);

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('room.created', { id: room.id });

        return {
            ok: true,
            status: 201,
            invokedMethod: 'Create Room',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: room
        };
    };
}

export function createGetRoomController(app) {
    return async function getRoomController(request) {
        const { id } = idParamSchema.parse(request.params);
        const room = await findRoomById(app.db.models, id);
        if (!room) {
            throw app.httpErrors.notFound('Room not found');
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Get Room',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: room
        };
    };
}

export function createUpdateRoomController(app) {
    return async function updateRoomController(request) {
        const { id } = idParamSchema.parse(request.params);
        const payload = updateRoomSchema.parse(request.body);

        const room = await updateRoom(app.db.models, id, payload);
        if (!room) {
            throw app.httpErrors.notFound('Room not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('room.updated', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Update Room',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: room
        };
    };
}

export function createDeleteRoomController(app) {
    return async function deleteRoomController(request) {
        const { id } = idParamSchema.parse(request.params);
        const room = await deleteRoom(app.db.models, id);
        if (!room) {
            throw app.httpErrors.notFound('Room not found');
        }

        app.tenantIO?.to(`tenant:${request.user?.tenantId}`).emit('room.deleted', { id });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Delete Room',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            data: { id }
        };
    };
}
