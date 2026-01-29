export async function registerSocket(app) {
    await app.ready();

    if (!app.io) {
        app.log.warn('Owner socket requested but fastify-socket.io not registered');
        return;
    }

    const namespaceName = process.env.OWNER_SOCKET_NAMESPACE || '/owner-events';
    const sharedToken = process.env.TENANT_SYNC_WEBHOOK_TOKEN;

    const namespace = app.io.of(namespaceName);

    namespace.use((socket, next) => {
        const provided = socket.handshake.auth?.token || socket.handshake.headers.authorization;
        const token = provided && provided.startsWith('Bearer ') ? provided.slice(7) : provided;

        if (!sharedToken) {
            return next(new Error('Owner socket shared token is not configured'));
        }

        if (token !== sharedToken) {
            return next(new Error('Unauthorized tenant bridge connection'));
        }

        return next();
    });

    namespace.on('connection', (socket) => {
        app.log.info({ id: socket.id }, 'Tenant bridge connected to owner socket');
        socket.emit('owner:connected', { ok: true });

        socket.on('tenant.telemetry', (payload) => {
            app.log.info({ payload }, 'Telemetry received from tenant');
            //>>> Domain handlers will persist metrics / trigger notifications.
        });

        socket.on('disconnect', (reason) => {
            app.log.debug({ id: socket.id, reason }, 'Tenant bridge disconnected');
        });
    });

    app.decorate('ownerIO', namespace);
}
