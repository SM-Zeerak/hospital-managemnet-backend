import {
    loginSchema,
    refreshSchema,
    requestResetSchema,
    resendResetSchema,
    resetPasswordSchema
} from './schemas.js';
import {
    verifyPassword,
    buildAuthPayload,
    signTokens,
    verifyRefreshToken,
    presentOwnerUser
} from './utils.js';
import {
    fetchActiveOwnerUser,
    issueOwnerPasswordReset,
    resendOwnerPasswordReset,
    resetOwnerPassword,
    createOwnerSession,
    verifyOwnerSession,
    rotateOwnerSession,
    revokeOwnerSession
} from './service.js';

export function createLoginController(app) {
    return async function loginController(request) {
        const { email, password } = loginSchema.parse(request.body);
        const user = await fetchActiveOwnerUser(app.db.models, email);

        if (!user) {
            throw app.httpErrors.unauthorized('Invalid credentials');
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            throw app.httpErrors.unauthorized('Invalid credentials');
        }

        user.lastLoginAt = new Date();
        await user.save({ fields: ['lastLoginAt'] });

        const payload = buildAuthPayload(user);
        const tokens = signTokens(app, payload);

        await createOwnerSession(app.db.models, user.id, tokens.refreshToken, {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            expiresAt: tokens.refreshExpiresAt ?? null
        });

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Login',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'Login successful',
            data: {
                ...tokens,
                user: presentOwnerUser(user)
            }
        };
    };
}

export function createRefreshController(app) {
    return async function refreshController(request) {
        const { refreshToken } = refreshSchema.parse(request.body);

        try {
            const decoded = verifyRefreshToken(app, refreshToken);
            const activeUser = await fetchActiveOwnerUser(app.db.models, decoded.email);
            if (!activeUser || activeUser.id !== decoded.userId) {
                throw app.httpErrors.unauthorized('Account disabled');
            }

            const sessionResult = await verifyOwnerSession(app.db.models, activeUser.id, refreshToken);
            if (!sessionResult.ok) {
                const reason = sessionResult.reason ?? 'invalid';
                const message = reason === 'revoked'
                    ? 'Refresh token revoked'
                    : reason === 'expired'
                        ? 'Refresh token expired'
                        : 'Invalid refresh token';
                throw app.httpErrors.unauthorized(message);
            }

            const payload = buildAuthPayload(activeUser);
            const tokens = signTokens(app, payload);

            await rotateOwnerSession(sessionResult.session, tokens.refreshToken, {
                userAgent: request.headers['user-agent'],
                ipAddress: request.ip,
                expiresAt: tokens.refreshExpiresAt ?? null
            });

            return {
                ok: true,
                status: 200,
                invokedMethod: 'Refresh Token',
                responseTime: request.responseTime,
                timestamp: new Date().toISOString(),
                message: 'Token refreshed successfully',
                data: {
                    ...tokens,
                    user: presentOwnerUser(activeUser)
                },
                meta: {
                    refreshToken: refreshToken,
                    refreshTokenExpiresAt: tokens.refreshExpiresAt,
                    refreshTokenIssuedAt: tokens.refreshIssuedAt
                }
            };
        } catch (error) {
            request.log.warn({ error }, 'Failed to refresh owner token');
            throw app.httpErrors.unauthorized('Invalid refresh token');
        }
    };
}

export function createLogoutController(app) {
    return async function logoutController(request) {
        // Try x-refresh-token header first, then fall back to Authorization header
        const xRefreshToken = request.headers['x-refresh-token'] || request.headers['X-Refresh-Token'] || '';
        const authorization = request.headers.authorization || '';
        
        let refreshToken = xRefreshToken.trim();
        if (!refreshToken) {
            refreshToken = authorization.replace(/^Bearer\s+/i, '').trim();
        }

        if (!refreshToken) {
            throw app.httpErrors.badRequest('Refresh token required');
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(app, refreshToken);
        } catch (error) {
            request.log.warn({ error }, 'Failed to verify refresh token for logout');
            throw app.httpErrors.unauthorized('Invalid refresh token');
        }

        const userId = decoded?.userId || decoded?.id;
        if (!userId) {
            throw app.httpErrors.badRequest('Invalid refresh token payload');
        }

        const result = await revokeOwnerSession(app.db.models, userId, refreshToken);
        if (!result.ok && result.reason !== 'already_revoked') {
            throw app.httpErrors.badRequest('Refresh token not recognised');
        }

        return { 
            ok: true,
            status: 200,
            invokedMethod: 'Logout',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString()
        };
    };
}

export function createRequestResetController(app) {
    const hideToken = process.env.NODE_ENV === 'production';

    return async function requestResetController(request) {
        const { email } = requestResetSchema.parse(request.body);
        const user = await fetchActiveOwnerUser(app.db.models, email);

        let tokenData = null;
        if (user) {
            tokenData = await issueOwnerPasswordReset(app.db.models, user);
            const resetBaseUrl =
                process.env.OWNER_PASSWORD_RESET_URL || `${process.env.OWNER_UI_ORIGIN || ''}/reset-password`;
            const resetLink = tokenData
                ? `${resetBaseUrl}?token=${encodeURIComponent(tokenData.token)}`
                : null;

            request.log.info(
                {
                    ownerUserId: user.id,
                    tokenSnippet: tokenData.token.slice(0, 8),
                    expiresAt: tokenData.expiresAt,
                    otpExpiresAt: tokenData.otpExpiresAt
                },
                'Owner password reset issued'
            );

            if (app.mailer && resetLink) {
                try {
                    await app.mailer.sendMail({
                        to: user.email,
                        subject: 'Freight CRM Owner Password Reset',
                        text: [
                            'You recently requested to reset your Freight CRM owner account password.',
                            `Your verification code: ${tokenData.otp}`,
                            `This code expires in ${process.env.OWNER_PASSWORD_RESET_OTP_TTL || 10} minutes.`,
                            '',
                            `Use the link below to set a new password:`,
                            resetLink,
                            '',
                            'If you did not request this change, you can safely ignore this email.'
                        ].join('\n'),
                        html: `
                            <p>You recently requested to reset your Freight CRM owner account password.</p>
                            <p><strong>Your verification code:</strong></p>
                            <div style="font-size:22px;font-weight:bold;letter-spacing:4px;">${tokenData.otp}</div>
                            <p><a href="${resetLink}">Click here to set a new password</a>.</p>
                            <p>If you prefer, you can copy this token and paste it in the reset form:</p>
                            <pre style="background:#f4f4f4;padding:12px;border-radius:4px;">${tokenData.token}</pre>
                            <p>If you did not request this change, you can safely ignore this email.</p>
                        `
                    });
                } catch (error) {
                    request.log.error(
                        {
                            err: error,
                            ownerUserId: user.id
                        },
                        'Failed to dispatch password reset email'
                    );
                }
            }
        }

        const response = {
            ok: true,
            status: 200,
            invokedMethod: 'Request Password Reset',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'If that account exists, password reset instructions have been sent.',
            data: {}
        };

        if (!hideToken && tokenData) {
            response.data.otp = tokenData.otp;
            response.data.expiresAt = tokenData.expiresAt;
            response.data.otpExpiresAt = tokenData.otpExpiresAt;
            response.data.otpSentAt = tokenData.otpSentAt;
        }

        return response;
    };
}

export function createResendResetController(app) {
    const hideToken = process.env.NODE_ENV === 'production';

    return async function resendResetController(request) {
        const { email } = resendResetSchema.parse(request.body);
        const user = await fetchActiveOwnerUser(app.db.models, email);

        if (!user) {
            // mirror original behaviour: do not leak existence
            return {
                ok: true,
                status: 200,
                invokedMethod: 'Resend Password Reset',
                responseTime: request.responseTime,
                timestamp: new Date().toISOString(),
                message: 'If that account exists, password reset instructions have been sent.',
                data: {}
            };
        }

        const tokenData = await resendOwnerPasswordReset(app.db.models, user);
        const resetBaseUrl =
            process.env.OWNER_PASSWORD_RESET_URL || `${process.env.OWNER_UI_ORIGIN || ''}/reset-password`;
        const resetLink = `${resetBaseUrl}?token=${encodeURIComponent(tokenData.token)}`;

        if (app.mailer) {
            try {
                await app.mailer.sendMail({
                    to: user.email,
                    subject: 'Freight CRM Owner Password Reset Code',
                        text: [
                            'You requested a new verification code for your Freight CRM owner account.',
                            `Your verification code: ${tokenData.otp}`,
                            `This code expires in ${process.env.OWNER_PASSWORD_RESET_OTP_TTL || 10} minutes.`,
                            '',
                            `Use the link below to set a new password:`,
                    resetLink,
                            '',
                            'If you did not request this change, you can safely ignore this email.'
                        ].join('\n'),
                    html: `
                        <p>You requested a new verification code for your Freight CRM owner account.</p>
                        <p><strong>Your verification code:</strong></p>
                        <div style="font-size:22px;font-weight:bold;letter-spacing:4px;">${tokenData.otp}</div>
                        <p><a href="${resetLink}">Click here to set a new password</a>.</p>
                        <p>If you did not request this change, you can safely ignore this email.</p>
                    `
                });
            } catch (error) {
                request.log.error(
                    {
                        err: error,
                        ownerUserId: user.id
                    },
                    'Failed to dispatch password reset resend email'
                );
            }
        }

        const response = {
            ok: true,
            status: 200,
            invokedMethod: 'Resend Password Reset',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'If that account exists, password reset instructions have been sent.',
            data: {}
        };

        if (!hideToken) {
            response.data.otp = tokenData.otp;
            response.data.expiresAt = tokenData.expiresAt;
            response.data.otpExpiresAt = tokenData.otpExpiresAt;
            response.data.otpSentAt = tokenData.otpSentAt;
        }

        return response;
    };
}

export function createResetPasswordController(app) {
    return async function resetPasswordController(request) {
        const { token, password, otp } = resetPasswordSchema.parse(request.body);
        const result = await resetOwnerPassword(app.db.models, token, password, otp);

        if (!result.ok) {
            switch (result.reason) {
                case 'used':
                case 'expired':
                    throw app.httpErrors.badRequest('Password reset token expired');
                case 'otp_invalid':
                    throw app.httpErrors.badRequest('Invalid verification code');
                case 'otp_expired':
                    throw app.httpErrors.badRequest('Verification code expired');
                case 'otp_used':
                    throw app.httpErrors.badRequest('Verification code already used');
                case 'invalid':
                default:
                    throw app.httpErrors.badRequest('Invalid password reset token');
            }
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Reset Password',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'Password reset successfully'
        };
    };
}
