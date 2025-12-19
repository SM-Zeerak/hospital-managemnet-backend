export class StaffAuthController {
    constructor(staffAuthService) {
        this.staffAuthService = staffAuthService;
    }

    async login(request, reply) {
        try {
            const { email, password } = request.body;
            const ipAddress = request.ip;

            const result = await this.staffAuthService.login(email, password, ipAddress);

            // Log successful login
            if (request.app.auditLog) {
                request.app.auditLog('staff_login', {
                    staffId: result.staff.id,
                    email: result.staff.email,
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
                request.app.auditLog('staff_login', {
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
            const tokens = await this.staffAuthService.refreshToken(refreshToken);

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

    async forgotPassword(request, reply) {
        try {
            const { email } = request.body;
            const result = await this.staffAuthService.forgotPassword(email);

            // Log password reset request
            if (request.app.auditLog) {
                request.app.auditLog('staff_forgot_password', {
                    email: email,
                    ip: request.ip
                });
            }

            return reply.code(200).send({
                ok: true,
                data: result
            });
        } catch (error) {
            return reply.code(400).send({
                ok: false,
                error: {
                    code: 'FORGOT_PASSWORD_FAILED',
                    message: error.message
                }
            });
        }
    }

    async resetPassword(request, reply) {
        try {
            const { token, newPassword } = request.body;
            const result = await this.staffAuthService.resetPassword(token, newPassword);

            // Log password reset
            if (request.app.auditLog) {
                request.app.auditLog('staff_reset_password', {
                    ip: request.ip
                });
            }

            return reply.code(200).send({
                ok: true,
                data: result
            });
        } catch (error) {
            return reply.code(400).send({
                ok: false,
                error: {
                    code: 'RESET_PASSWORD_FAILED',
                    message: error.message
                }
            });
        }
    }

    async changePassword(request, reply) {
        try {
            const staffId = request.user.id;
            const { currentPassword, newPassword } = request.body;
            const result = await this.staffAuthService.changePassword(staffId, currentPassword, newPassword);

            // Log password change
            if (request.app.auditLog) {
                request.app.auditLog('staff_change_password', {
                    staffId: staffId,
                    ip: request.ip
                });
            }

            return reply.code(200).send({
                ok: true,
                data: result
            });
        } catch (error) {
            return reply.code(400).send({
                ok: false,
                error: {
                    code: 'CHANGE_PASSWORD_FAILED',
                    message: error.message
                }
            });
        }
    }

    async logout(request, reply) {
        try {
            const staffId = request.user.id;
            const result = await this.staffAuthService.logout(staffId);

            // Log logout
            if (request.app.auditLog) {
                request.app.auditLog('staff_logout', {
                    staffId,
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
            const staffId = request.user.id;
            const { Staff } = request.app.db.models;

            const staff = await Staff.findByPk(staffId);
            if (!staff) {
                return reply.code(404).send({
                    ok: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Staff not found'
                    }
                });
            }

            return reply.code(200).send({
                ok: true,
                data: staff.toJSON()
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

