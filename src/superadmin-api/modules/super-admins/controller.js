export class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }

    async create(request, reply) {
        try {
            const data = await this.superAdminService.create(request.body);

            // Log creation
            if (request.app.auditLog) {
                request.app.auditLog('superadmin_created', {
                    createdBy: request.user.id,
                    superAdminId: data.id,
                    email: data.email
                });
            }

            return reply.code(201).send({
                ok: true,
                data
            });
        } catch (error) {
            return reply.code(400).send({
                ok: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: error.message
                }
            });
        }
    }

    async update(request, reply) {
        try {
            const { id } = request.params;
            const currentUserId = request.user.id;

            const data = await this.superAdminService.update(id, request.body, currentUserId);

            // Log update
            if (request.app.auditLog) {
                request.app.auditLog('superadmin_updated', {
                    updatedBy: currentUserId,
                    superAdminId: id,
                    changes: request.body
                });
            }

            return reply.code(200).send({
                ok: true,
                data
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            return reply.code(statusCode).send({
                ok: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message
                }
            });
        }
    }

    async delete(request, reply) {
        try {
            const { id } = request.params;
            const currentUserId = request.user.id;

            const result = await this.superAdminService.delete(id, currentUserId);

            // Log deletion
            if (request.app.auditLog) {
                request.app.auditLog('superadmin_deleted', {
                    deletedBy: currentUserId,
                    superAdminId: id
                });
            }

            return reply.code(200).send({
                ok: true,
                data: result
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            return reply.code(statusCode).send({
                ok: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: error.message
                }
            });
        }
    }

    async getById(request, reply) {
        try {
            const { id } = request.params;
            const data = await this.superAdminService.getById(id);

            return reply.code(200).send({
                ok: true,
                data
            });
        } catch (error) {
            return reply.code(404).send({
                ok: false,
                error: {
                    code: 'NOT_FOUND',
                    message: error.message
                }
            });
        }
    }

    async list(request, reply) {
        try {
            const data = await this.superAdminService.list(request);

            return reply.code(200).send({
                ok: true,
                ...data
            });
        } catch (error) {
            return reply.code(500).send({
                ok: false,
                error: {
                    code: 'LIST_FAILED',
                    message: error.message
                }
            });
        }
    }
}

