import {
    loginSchema,
    refreshSchema,
    requestResetSchema,
    resendResetSchema,
    resetPasswordSchema,
    requestEmailVerificationSchema,
    resendEmailVerificationSchema,
    verifyEmailSchema
} from './schemas.js';
import {
    verifyPassword,
    buildAuthPayload,
    signTokens,
    verifyRefreshToken,
    presentTenantUser
} from './utils.js';
import {
    fetchActiveTenantUser,
    issueTenantPasswordReset,
    resendTenantPasswordReset,
    resetTenantPassword,
    createTenantSession,
    verifyTenantSession,
    rotateTenantSession,
    revokeTenantSession,
    issueTenantEmailVerification,
    resendTenantEmailVerification,
    verifyTenantEmail
} from './service.js';
import {
    passwordResetEmail,
    passwordResetResendEmail,
    emailVerificationOtpEmail,
    emailVerificationResendOtpEmail
} from './templates.js';

export function createLoginController(app) {
    const tenantId = process.env.TENANT_ID || null;

    return async function loginController(request) {
        const { email, password } = loginSchema.parse(request.body);
        const user = await fetchActiveTenantUser(app.db.models, email);

        if (!user) {
            throw app.httpErrors.unauthorized('Invalid credentials');
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            throw app.httpErrors.unauthorized('Invalid credentials');
        }

        user.lastLoginAt = new Date();
        await user.save({ fields: ['lastLoginAt'] });

        const payload = buildAuthPayload(user, tenantId);
        
        // Debug: Check JWT config
        if (!app.jwtConfig) {
            console.error('[LOGIN] app.jwtConfig is not defined');
            request.log.error('app.jwtConfig is not defined');
            throw app.httpErrors.internalServerError('JWT configuration missing');
        }
        
        console.log('[LOGIN] JWT Config exists:', { 
            hasAccessSecret: !!app.jwtConfig.accessSecret,
            hasRefreshSecret: !!app.jwtConfig.refreshSecret,
            accessTtl: app.jwtConfig.accessTtl,
            refreshTtl: app.jwtConfig.refreshTtl
        });
        
        // Generate tokens
        let tokens;
        try {
            tokens = signTokens(app, payload);
            console.log('[LOGIN] Tokens generated:', {
                hasAccessToken: !!tokens?.accessToken,
                hasRefreshToken: !!tokens?.refreshToken,
                tokenKeys: tokens ? Object.keys(tokens) : []
            });
        } catch (error) {
            console.error('[LOGIN] Failed to sign tokens:', error);
            request.log.error({ err: error, payload, jwtConfig: app.jwtConfig }, 'Failed to sign tokens');
            throw app.httpErrors.internalServerError('Failed to generate authentication tokens');
        }

        // Get user data
        const userData = presentTenantUser(user);
        console.log('[LOGIN] User data:', {
            hasUserData: !!userData,
            userId: userData?.id,
            hasRoles: !!userData?.roles,
            userKeys: userData ? Object.keys(userData) : [],
            userDataString: JSON.stringify(userData).substring(0, 300)
        });
        
        // Ensure userData is a plain object (not a Sequelize model)
        let plainUserData = null;
        if (userData) {
            try {
                // Force serialization to catch any circular references
                plainUserData = JSON.parse(JSON.stringify(userData));
                console.log('[LOGIN] User data serialized successfully');
            } catch (error) {
                console.error('[LOGIN] Failed to serialize user data:', error);
                // Fallback: manually extract safe properties
                plainUserData = {
                    id: userData.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    roles: Array.isArray(userData.roles) ? userData.roles : [],
                    permissions: Array.isArray(userData.permissions) ? userData.permissions : []
                };
            }
        }

        await createTenantSession(app.db.models, user.id, tokens.refreshToken, {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            expiresAt: null // Will use default from service
        });

        // Validate tokens were generated
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
            console.error('[LOGIN] Tokens are missing or invalid:', { tokens });
            request.log.error({ tokens }, 'Tokens are missing or invalid');
            throw app.httpErrors.internalServerError('Failed to generate authentication tokens');
        }

        // Convert Date objects to ISO strings for JSON serialization
        const responseData = {
            accessToken: tokens.accessToken || null,
            refreshToken: tokens.refreshToken || null,
            accessIssuedAt: tokens.accessIssuedAt ? tokens.accessIssuedAt.toISOString() : null,
            accessExpiresAt: tokens.accessExpiresAt ? tokens.accessExpiresAt.toISOString() : null,
            refreshIssuedAt: tokens.refreshIssuedAt ? tokens.refreshIssuedAt.toISOString() : null,
            refreshExpiresAt: tokens.refreshExpiresAt ? tokens.refreshExpiresAt.toISOString() : null,
            user: plainUserData || null
        };
        
        // Test serialization of responseData
        try {
            const testSerialization = JSON.stringify(responseData);
            console.log('[LOGIN] Response data serialization test passed, length:', testSerialization.length);
        } catch (error) {
            console.error('[LOGIN] Response data serialization failed:', error);
        }

        console.log('[LOGIN] Response data prepared:', {
            hasAccessToken: !!responseData.accessToken,
            hasRefreshToken: !!responseData.refreshToken,
            hasUser: !!responseData.user,
            dataKeys: Object.keys(responseData),
            data: JSON.stringify(responseData).substring(0, 200) // First 200 chars
        });

        const response = {
            ok: true,
            status: 200,
            invokedMethod: 'Login',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'Login successful',
            data: responseData
        };

        console.log('[LOGIN] Final response:', {
            responseKeys: Object.keys(response),
            dataKeys: Object.keys(response.data),
            dataType: typeof response.data,
            dataIsEmpty: Object.keys(response.data || {}).length === 0
        });

        return response;
    };
}

export function createRefreshController(app) {
    const fallbackTenantId = process.env.TENANT_ID || null;

    return async function refreshController(request) {
        if (!request.body || typeof request.body !== 'object') {
            throw app.httpErrors.badRequest('Request body is required');
        }

        const { refreshToken } = refreshSchema.parse(request.body);

        try {
            const decoded = verifyRefreshToken(app, refreshToken);
            const activeUser = await fetchActiveTenantUser(app.db.models, decoded.email);
            
            if (!activeUser || activeUser.id !== decoded.userId) {
                throw app.httpErrors.unauthorized('Account disabled or invalid');
            }

            const sessionResult = await verifyTenantSession(app.db.models, activeUser.id, refreshToken);
            if (!sessionResult.ok) {
                const reason = sessionResult.reason ?? 'invalid';
                const message = reason === 'revoked'
                    ? 'Refresh token revoked'
                    : reason === 'expired'
                        ? 'Refresh token expired'
                        : 'Invalid refresh token';
                throw app.httpErrors.unauthorized(message);
            }

            const payload = buildAuthPayload(activeUser, decoded.tenantId || fallbackTenantId);
            const tokens = signTokens(app, payload);

            await rotateTenantSession(sessionResult.session, tokens.refreshToken, {
                userAgent: request.headers['user-agent'],
                ipAddress: request.ip,
                expiresAt: null
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
                    user: presentTenantUser(activeUser)
                }
            };
        } catch (error) {
            request.log.warn({ error }, 'Failed to refresh tenant token');
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

        const result = await revokeTenantSession(app.db.models, userId, refreshToken);
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
    const hideOtp = process.env.NODE_ENV === 'production';
    const otpTtlMinutes = Number(process.env.TENANT_PASSWORD_RESET_OTP_TTL || 10);

    return async function requestResetController(request) {
        const { email } = requestResetSchema.parse(request.body);
        const user = await fetchActiveTenantUser(app.db.models, email);

        let tokenData = null;
        if (user) {
            tokenData = await issueTenantPasswordReset(app.db.models, user);

            request.log.info(
                {
                    userId: user.id,
                    tokenSnippet: tokenData.token.slice(0, 8),
                    expiresAt: tokenData.expiresAt,
                    otpExpiresAt: tokenData.otpExpiresAt
                },
                'Tenant password reset issued'
            );

            if (app.mailer) {
                try {
                    const emailContent = passwordResetEmail({
                        otp: tokenData.otp,
                        ttlMinutes: otpTtlMinutes
                    });

                    await app.mailer.sendMail({
                        to: user.email,
                        subject: emailContent.subject,
                        text: emailContent.text,
                        html: emailContent.html
                    });
                } catch (error) {
                    request.log.error(
                        {
                            err: error,
                            userId: user.id
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

        if (!hideOtp && tokenData) {
            response.data.otp = tokenData.otp;
            response.data.expiresAt = tokenData.expiresAt;
            response.data.otpExpiresAt = tokenData.otpExpiresAt;
            response.data.otpSentAt = tokenData.otpSentAt;
        }

        return response;
    };
}

export function createResendResetController(app) {
    const hideOtp = process.env.NODE_ENV === 'production';
    const otpTtlMinutes = Number(process.env.TENANT_PASSWORD_RESET_OTP_TTL || 10);

    return async function resendResetController(request) {
        const { email } = resendResetSchema.parse(request.body);
        const user = await fetchActiveTenantUser(app.db.models, email);

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

        const tokenData = await resendTenantPasswordReset(app.db.models, user);

        if (app.mailer) {
            try {
                const emailContent = passwordResetResendEmail({
                    otp: tokenData.otp,
                    ttlMinutes: otpTtlMinutes
                });

                await app.mailer.sendMail({
                    to: user.email,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html
                });
            } catch (error) {
                request.log.error(
                    {
                        err: error,
                        userId: user.id
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

        if (!hideOtp) {
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
        const result = await resetTenantPassword(app.db.models, token, password, otp);

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

export function createRequestEmailVerificationController(app) {
    const hideOtp = process.env.NODE_ENV === 'production';
    const otpTtlMinutes = Number(process.env.TENANT_EMAIL_VERIFICATION_OTP_TTL || 10);

    return async function requestEmailVerificationController(request) {
        const { email } = requestEmailVerificationSchema.parse(request.body);
        const user = await fetchActiveTenantUser(app.db.models, email);

        if (!user) {
            throw app.httpErrors.notFound('User not found');
        }

        const otpData = await issueTenantEmailVerification(app.db.models, user, email);

        request.log.info(
            {
                userId: user.id,
                email,
                otpExpiresAt: otpData.otpExpiresAt
            },
            'Tenant email verification issued'
        );

        if (app.mailer) {
            try {
                const emailContent = emailVerificationOtpEmail({
                    otp: otpData.otp,
                    ttlMinutes: otpTtlMinutes,
                    email
                });

                await app.mailer.sendMail({
                    to: email,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html
                });
            } catch (error) {
                request.log.error(
                    {
                        err: error,
                        userId: user.id,
                        email
                    },
                    'Failed to dispatch email verification email'
                );
            }
        }

        const response = {
            ok: true,
            status: 200,
            invokedMethod: 'Request Email Verification',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'Email verification code has been sent.',
            data: {}
        };

        if (!hideOtp) {
            response.data.otp = otpData.otp;
            response.data.otpExpiresAt = otpData.otpExpiresAt;
            response.data.otpSentAt = otpData.otpSentAt;
        }

        return response;
    };
}

export function createResendEmailVerificationController(app) {
    const hideOtp = process.env.NODE_ENV === 'production';
    const otpTtlMinutes = Number(process.env.TENANT_EMAIL_VERIFICATION_OTP_TTL || 10);

    return async function resendEmailVerificationController(request) {
        const { email } = resendEmailVerificationSchema.parse(request.body);
        const user = await fetchActiveTenantUser(app.db.models, email);

        if (!user) {
            throw app.httpErrors.notFound('User not found');
        }

        const otpData = await resendTenantEmailVerification(app.db.models, user, email);

        if (app.mailer) {
            try {
                const emailContent = emailVerificationResendOtpEmail({
                    otp: otpData.otp,
                    ttlMinutes: otpTtlMinutes,
                    email
                });

                await app.mailer.sendMail({
                    to: email,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html
                });
            } catch (error) {
                request.log.error(
                    {
                        err: error,
                        userId: user.id,
                        email
                    },
                    'Failed to dispatch email verification resend email'
                );
            }
        }

        const response = {
            ok: true,
            status: 200,
            invokedMethod: 'Resend Email Verification',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'Email verification code has been sent.',
            data: {}
        };

        if (!hideOtp) {
            response.data.otp = otpData.otp;
            response.data.otpExpiresAt = otpData.otpExpiresAt;
            response.data.otpSentAt = otpData.otpSentAt;
        }

        return response;
    };
}

export function createVerifyEmailController(app) {
    return async function verifyEmailController(request) {
        const { email, otp } = verifyEmailSchema.parse(request.body);
        
        // Get user from email
        const user = await fetchActiveTenantUser(app.db.models, email);
        if (!user) {
            throw app.httpErrors.notFound('User not found');
        }

        const result = await verifyTenantEmail(app.db.models, user.id, email, otp);

        if (!result.ok) {
            switch (result.reason) {
                case 'otp_invalid':
                    throw app.httpErrors.badRequest('Invalid verification code');
                case 'otp_expired':
                    throw app.httpErrors.badRequest('Verification code expired');
                case 'otp_used':
                    throw app.httpErrors.badRequest('Verification code already used');
                case 'not_found':
                default:
                    throw app.httpErrors.badRequest('Email verification not found or already verified');
            }
        }

        return {
            ok: true,
            status: 200,
            invokedMethod: 'Verify Email',
            responseTime: request.responseTime,
            timestamp: new Date().toISOString(),
            message: 'Email verified successfully',
            data: {
                user: result.user
            }
        };
    };
}
