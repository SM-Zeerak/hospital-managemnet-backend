import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import dayjs from 'dayjs';
import {
    hashToken,
    generateOtpCode,
    hashOtp,
    deriveOtpExpiry,
    presentOwnerUser
} from './utils.js';

const DEFAULT_RESET_TTL_MINUTES = Number(process.env.OWNER_PASSWORD_RESET_TTL_MINUTES || 60);

export async function fetchActiveOwnerUser(models, email) {
    const { OwnerUser } = models;
    const user = await OwnerUser.findOne({
        where: {
            email,
            isActive: true
        }
    });
    return user;
}


export async function issueOwnerPasswordReset(models, ownerUser) {
    const { OwnerPasswordReset } = models;
    if (!OwnerPasswordReset) {
        throw new Error('OwnerPasswordReset model not initialised');
    }

    await OwnerPasswordReset.destroy({
        where: {
            ownerUserId: ownerUser.id
        }
    });

    const token = randomUUID();
    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpSentAt = new Date();
    const expiresAt = new Date(Date.now() + DEFAULT_RESET_TTL_MINUTES * 60 * 1000);
    const otpExpiresAt = deriveOtpExpiry();

    await OwnerPasswordReset.create({
        ownerUserId: ownerUser.id,
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

export async function resendOwnerPasswordReset(models, ownerUser) {
    const { OwnerPasswordReset } = models;
    if (!OwnerPasswordReset) {
        throw new Error('OwnerPasswordReset model not initialised');
    }

    const record = await OwnerPasswordReset.findOne({
        where: {
            ownerUserId: ownerUser.id,
            usedAt: null
        },
        order: [['createdAt', 'DESC']]
    });

    if (!record) {
        return issueOwnerPasswordReset(models, ownerUser);
    }

    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpSentAt = new Date();
    const otpExpiresAt = deriveOtpExpiry();

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

export async function resetOwnerPassword(models, token, password, otp) {
    const { OwnerPasswordReset, OwnerUser } = models;
    if (!OwnerPasswordReset) {
        throw new Error('OwnerPasswordReset model not initialised');
    }

    const record = await OwnerPasswordReset.findOne({
        where: { token },
        include: [{ model: OwnerUser, as: 'ownerUser' }]
    });

    if (!record || !record.ownerUser) {
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
    await record.ownerUser.update({ passwordHash });
    await record.update({
        usedAt: new Date(),
        otpHash: null,
        isOtpUsed: true
    });

    return {
        ok: true,
        user: presentOwnerUser(record.ownerUser)
    };
}


export async function createOwnerSession(models, ownerUserId, refreshToken, meta = {}) {
    const { OwnerSession } = models;
    if (!OwnerSession) {
        throw new Error('OwnerSession model not initialised');
    }

    const refreshTokenHash = hashToken(refreshToken);

    const session = await OwnerSession.create({
        ownerUserId,
        refreshTokenHash,
        userAgent: meta.userAgent?.slice(0, 255) ?? null,
        ipAddress: meta.ipAddress?.slice(0, 64) ?? null,
        expiresAt: meta.expiresAt ?? dayjs().add(30, 'day').toDate(),
        revokedAt: null
    });

    return session;
}

export async function verifyOwnerSession(models, ownerUserId, refreshToken) {
    const { OwnerSession } = models;
    if (!OwnerSession) {
        throw new Error('OwnerSession model not initialised');
    }
    const hashed = hashToken(refreshToken);
    const session = await OwnerSession.findOne({
        where: {
            ownerUserId,
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

export async function rotateOwnerSession(session, refreshToken, meta = {}) {
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

export async function revokeOwnerSession(models, ownerUserId, refreshToken) {
    const { OwnerSession } = models;
    if (!OwnerSession) {
        throw new Error('OwnerSession model not initialised');
    }

    const hashed = hashToken(refreshToken);
    const session = await OwnerSession.findOne({
        where: {
            ownerUserId,
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
