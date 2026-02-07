import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import {
    hashToken,
    generateOtpCode,
    hashOtp,
    derivePasswordResetOtpExpiry,
    deriveEmailVerificationOtpExpiry,
    presentTenantUser
} from './utils.js';

const DEFAULT_RESET_TTL_MINUTES = Number(process.env.TENANT_PASSWORD_RESET_TTL_MINUTES || 60);

export async function fetchActiveTenantUser(models, email) {
    const { TenantUser, Department, Role, Permission } = models;
    const user = await TenantUser.findOne({
        where: {
            email,
            status: 'active'
        },
        include: [
            {
                model: Department,
                as: 'department'
            },
            {
                model: Role,
                as: 'roleEntities',
                through: { attributes: [] },
                attributes: ['id', 'name', 'description'],
                include: [
                    {
                        model: Permission,
                        as: 'permissionEntities',
                        through: { attributes: [] }
                    }
                ]
            }
        ]
    });
    
    if (user) {
        // Compute roles and permissions from associations
        const roles = user.roleEntities?.map(r => r.name) || [];
        const permissions = new Set();
        user.roleEntities?.forEach(role => {
            role.permissionEntities?.forEach(perm => {
                permissions.add(perm.key);
            });
        });
        
        // Add as virtual properties
        user.roles = roles;
        user.permissions = Array.from(permissions);
    }
    
    return user;
}

export async function issueTenantPasswordReset(models, tenantUser) {
    const { TenantPasswordReset } = models;
    if (!TenantPasswordReset) {
        throw new Error('TenantPasswordReset model not initialised');
    }

    await TenantPasswordReset.destroy({
        where: {
            userId: tenantUser.id
        }
    });

    const token = randomUUID();
    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpSentAt = new Date();
    const expiresAt = new Date(Date.now() + DEFAULT_RESET_TTL_MINUTES * 60 * 1000);
    const otpExpiresAt = derivePasswordResetOtpExpiry();

    await TenantPasswordReset.create({
        userId: tenantUser.id,
        token,
        expiresAt,
        otpHash,
        otpSentAt,
        otpExpiresAt,
        isOtpUsed: false
    });

    return {
        token,
        expiresAt,
        otp,
        otpSentAt,
        otpExpiresAt
    };
}

export async function resendTenantPasswordReset(models, tenantUser) {
    const { TenantPasswordReset } = models;
    if (!TenantPasswordReset) {
        throw new Error('TenantPasswordReset model not initialised');
    }

    const record = await TenantPasswordReset.findOne({
        where: {
            userId: tenantUser.id,
            usedAt: null
        },
        order: [['createdAt', 'DESC']]
    });

    if (!record) {
        return issueTenantPasswordReset(models, tenantUser);
    }

    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpSentAt = new Date();
    const otpExpiresAt = derivePasswordResetOtpExpiry();

    await record.update({
        otpHash,
        otpSentAt,
        otpExpiresAt,
        isOtpUsed: false
    });

    return {
        token: record.token,
        expiresAt: record.expiresAt,
        otp,
        otpSentAt,
        otpExpiresAt
    };
}

export async function resetTenantPassword(models, token, password, otp) {
    const { TenantPasswordReset, TenantUser } = models;
    if (!TenantPasswordReset) {
        throw new Error('TenantPasswordReset model not initialised');
    }

    const { Role, Permission } = models;
    const record = await TenantPasswordReset.findOne({
        where: { token },
        include: [{
            model: TenantUser,
            as: 'user',
            include: [
                {
                    model: Role,
                    as: 'roleEntities',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'description'],
                    include: [
                        {
                            model: Permission,
                            as: 'permissionEntities',
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        }]
    });

    if (!record || !record.user) {
        return { ok: false, reason: 'invalid' };
    }

    if (record.usedAt) {
        return { ok: false, reason: 'used' };
    }

    if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
        return { ok: false, reason: 'expired' };
    }

    if (!otp || !record.otpHash || hashOtp(otp) !== record.otpHash) {
        return { ok: false, reason: 'otp_invalid' };
    }

    if (record.isOtpUsed) {
        return { ok: false, reason: 'otp_used' };
    }

    if (record.otpExpiresAt && dayjs(record.otpExpiresAt).isBefore(dayjs())) {
        return { ok: false, reason: 'otp_expired' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await record.user.update({ passwordHash });
    await record.update({
        usedAt: new Date(),
        otpHash: null,
        isOtpUsed: true
    });

    return {
        ok: true,
        user: presentTenantUser(record.user)
    };
}

export async function createTenantSession(models, userId, refreshToken, meta = {}) {
    const { TenantSession } = models;
    if (!TenantSession) {
        throw new Error('TenantSession model not initialised');
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await TenantSession.create({
        userId,
        refreshTokenHash,
        userAgent: meta.userAgent?.slice(0, 255) ?? null,
        ipAddress: meta.ipAddress?.slice(0, 64) ?? null,
        expiresAt: meta.expiresAt ?? dayjs().add(30, 'day').toDate(),
        revokedAt: null
    });

    return session;
}

export async function verifyTenantSession(models, userId, refreshToken) {
    const { TenantSession } = models;
    if (!TenantSession) {
        throw new Error('TenantSession model not initialised');
    }
    const hashed = hashToken(refreshToken);
    const session = await TenantSession.findOne({
        where: {
            userId,
            refreshTokenHash: hashed
        }
    });

    if (!session) {
        return { ok: false, reason: 'not_found' };
    }

    if (session.revokedAt) {
        return { ok: false, reason: 'revoked' };
    }

    if (session.expiresAt && dayjs(session.expiresAt).isBefore(dayjs())) {
        return { ok: false, reason: 'expired' };
    }

    return { ok: true, session };
}

export async function rotateTenantSession(session, refreshToken, meta = {}) {
    const updates = {
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: meta.expiresAt ?? session.expiresAt,
        userAgent: meta.userAgent?.slice(0, 255) ?? session.userAgent,
        ipAddress: meta.ipAddress?.slice(0, 64) ?? session.ipAddress,
        revokedAt: null
    };
    await session.update(updates);
    return session;
}

export async function revokeTenantSession(models, userId, refreshToken) {
    const { TenantSession } = models;
    if (!TenantSession) {
        throw new Error('TenantSession model not initialised');
    }

    const hashed = hashToken(refreshToken);
    const session = await TenantSession.findOne({
        where: {
            userId,
            refreshTokenHash: hashed
        }
    });

    if (!session) {
        return { ok: false, reason: 'not_found' };
    }

    if (session.revokedAt) {
        return { ok: true, reason: 'already_revoked' };
    }

    await session.update({
        revokedAt: new Date()
    });

    return { ok: true };
}

export async function issueTenantEmailVerification(models, tenantUser, email) {
    const { TenantEmailVerification } = models;
    if (!TenantEmailVerification) {
        throw new Error('TenantEmailVerification model not initialised');
    }

    // Delete any existing unverified verifications for this user and email
    await TenantEmailVerification.destroy({
        where: {
            userId: tenantUser.id,
            email,
            verifiedAt: null
        }
    });

    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpSentAt = new Date();
    const otpExpiresAt = deriveEmailVerificationOtpExpiry();

    await TenantEmailVerification.create({
        userId: tenantUser.id,
        email,
        otpHash,
        otpSentAt,
        otpExpiresAt,
        isOtpUsed: false
    });

    return {
        otp,
        otpSentAt,
        otpExpiresAt
    };
}

export async function resendTenantEmailVerification(models, tenantUser, email) {
    const { TenantEmailVerification } = models;
    if (!TenantEmailVerification) {
        throw new Error('TenantEmailVerification model not initialised');
    }

    const record = await TenantEmailVerification.findOne({
        where: {
            userId: tenantUser.id,
            email,
            verifiedAt: null
        },
        order: [['createdAt', 'DESC']]
    });

    if (!record) {
        return issueTenantEmailVerification(models, tenantUser, email);
    }

    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpSentAt = new Date();
    const otpExpiresAt = deriveEmailVerificationOtpExpiry();

    await record.update({
        otpHash,
        otpSentAt,
        otpExpiresAt,
        isOtpUsed: false
    });

    return {
        otp,
        otpSentAt,
        otpExpiresAt
    };
}

export async function verifyTenantEmail(models, userId, email, otp) {
    const { TenantEmailVerification, TenantUser } = models;
    if (!TenantEmailVerification) {
        throw new Error('TenantEmailVerification model not initialised');
    }

    const { Role, Permission } = models;
    const record = await TenantEmailVerification.findOne({
        where: {
            userId,
            email,
            verifiedAt: null
        },
        include: [{
            model: TenantUser,
            as: 'user',
            include: [
                {
                    model: Role,
                    as: 'roleEntities',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'description'],
                    include: [
                        {
                            model: Permission,
                            as: 'permissionEntities',
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        }],
        order: [['createdAt', 'DESC']]
    });

    if (!record || !record.user) {
        return { ok: false, reason: 'not_found' };
    }

    if (record.isOtpUsed) {
        return { ok: false, reason: 'otp_used' };
    }

    if (record.otpExpiresAt && dayjs(record.otpExpiresAt).isBefore(dayjs())) {
        return { ok: false, reason: 'otp_expired' };
    }

    if (!otp || !record.otpHash || hashOtp(otp) !== record.otpHash) {
        return { ok: false, reason: 'otp_invalid' };
    }

    // Mark email as verified in user record
    await record.user.update({ email });
    
    // Mark verification as used
    await record.update({
        verifiedAt: new Date(),
        isOtpUsed: true
    });

    return {
        ok: true,
        user: presentTenantUser(record.user)
    };
}
