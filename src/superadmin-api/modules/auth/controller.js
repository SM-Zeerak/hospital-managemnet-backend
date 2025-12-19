export class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async login(request, reply) {
        try {
            const { email, password } = request.body;
            const ipAddress = request.ip;

            const result = await this.authService.login(email, password, ipAddress);

            // Log successful login
            if (request.app.auditLog) {
                request.app.auditLog('superadmin_login', {
                    superAdminId: result.superAdmin.id,
                    email: result.superAdmin.email,
                    ip: ipAddress,
                    success: true
                });
            }

            return reply.code(200).send({
                ok: true,
                data: result
            });
        } catch (error) {
            // Log failed login attempt
            if (request.app.auditLog) {
                request.app.auditLog('superadmin_login', {
                    email: request.body.email,
                    ip: request.ip,
                    success: false,
                    error: error.message
                });
            }

            return reply.code(401).send({
                ok: false,
                error: {
                    code: 'AUTHENTICATION_FAILED',
                    message: error.message
                }
            });
        }
    }

    async refreshToken(request, reply) {
        try {
            const { refreshToken } = request.body;
            const tokens = await this.authService.refreshToken(refreshToken);

            return reply.code(200).send({
                ok: true,
                data: tokens
            });
        } catch (error) {
            return reply.code(401).send({
                ok: false,
                error: {
                    code: 'REFRESH_TOKEN_INVALID',
                    message: error.message
                }
            });
        }
    }

    async logout(request, reply) {
        try {
            const superAdminId = request.user.id;
            const result = await this.authService.logout(superAdminId);

            // Log logout
            if (request.app.auditLog) {
                request.app.auditLog('superadmin_logout', {
                    superAdminId,
                    ip: request.ip
                });
            }

            return reply.code(200).send({
                ok: true,
                data: result
            });
        } catch (error) {
            return reply.code(500).send({
                ok: false,
                error: {
                    code: 'LOGOUT_FAILED',
                    message: error.message
                }
            });
        }
    }

    async getProfile(request, reply) {
        try {
            const superAdminId = request.user.id;
            const { SuperAdmin } = request.app.db.models;

            const superAdmin = await SuperAdmin.findByPk(superAdminId);
            if (!superAdmin) {
                return reply.code(404).send({
                    ok: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Super admin not found'
                    }
                });
            }

            return reply.code(200).send({
                ok: true,
                data: superAdmin.toJSON()
            });
        } catch (error) {
            return reply.code(500).send({
                ok: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: error.message
                }
            });
        }
    }
}

