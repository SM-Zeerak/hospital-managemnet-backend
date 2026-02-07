import { registerRoomRoutes } from './routes.js';

export async function registerRoomsModule(app) {
    registerRoomRoutes(app);
}
