import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import dayjs from 'dayjs';

const TOKEN_HASH_ALGO = 'sha256';
const OTP_LENGTH = Number(process.env.OWNER_PASSWORD_RESET_OTP_LENGTH || 6);
const OTP_TTL_MINUTES = Number(process.env.OWNER_PASSWORD_RESET_OTP_TTL || 10);

/**
 * Sanitizes owner user by removing sensitive fields
 * @param {Object} user - Owner user object
 * @returns {Object|null} Sanitized user object
 */
export function sanitizeOwnerUser(user) {
    if (!user) {
        return null;
    }
    const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;
    delete plain.passwordHash;
    return plain;
}

/**
 * Verifies a plain password against a hash
 * @param {string} plain - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

/**
 * Builds authentication payload for JWT tokens
 * @param {Object} source - User object
 * @returns {Object} JWT payload
 */
export function buildAuthPayload(source) {
    return {
        userId: source.userId || source.id,
        email: source.email,
        role: source.role
    };
}

/**
 * Hashes a token using SHA-256
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export function hashToken(token) {
    return createHash(TOKEN_HASH_ALGO).update(token).digest('hex');
}

/**
 * Generates a random OTP code of specified length
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} OTP code
 */
export function generateOtpCode(length = OTP_LENGTH) {
    const normalizedLength = Number.isInteger(length) && length > 0 ? length : 6;
    const min = 10 ** (normalizedLength - 1);
    const max = 10 ** normalizedLength - 1;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    return String(code).padStart(normalizedLength, '0');
}

/**
 * Hashes an OTP code
 * @param {string} otp - OTP code to hash
 * @returns {string} Hashed OTP
 */
export function hashOtp(otp) {
    return createHash(TOKEN_HASH_ALGO).update(`otp:${otp}`).digest('hex');
}

/**
 * Signs access and refresh tokens
 * @param {Object} app - Fastify app instance
 * @param {Object} payload - JWT payload
 * @returns {Object} Tokens and metadata
 */
export function signTokens(app, payload) {
    const config = app.jwtConfig || {};
    const accessToken = app.jwt.sign(payload, {
        expiresIn: config.accessTtl,
        secret: config.accessSecret
    });
    const refreshToken = app.jwt.sign(payload, {
        expiresIn: config.refreshTtl,
        secret: config.refreshSecret
    });

    const accessDecoded = app.jwt.decode(accessToken);
    const refreshDecoded = app.jwt.decode(refreshToken);

    return {
        accessToken,
        refreshToken,
        accessIssuedAt: accessDecoded?.iat ? dayjs.unix(accessDecoded.iat).toDate() : new Date(),
        accessExpiresAt: accessDecoded?.exp ? dayjs.unix(accessDecoded.exp).toDate() : null,
        refreshIssuedAt: refreshDecoded?.iat ? dayjs.unix(refreshDecoded.iat).toDate() : new Date(),
        refreshExpiresAt: refreshDecoded?.exp ? dayjs.unix(refreshDecoded.exp).toDate() : null
    };
}

/**
 * Verifies a refresh token
 * @param {Object} app - Fastify app instance
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyRefreshToken(app, token) {
    const config = app.jwtConfig || {};
    return app.jwt.verify(token, {
        secret: config.refreshSecret
    });
}

/**
 * Derives OTP expiry date
 * @returns {Date} OTP expiry date
 */
export function deriveOtpExpiry() {
    return dayjs().add(OTP_TTL_MINUTES, 'minute').toDate();
}

/**
 * Presents owner user (sanitized)
 * @param {Object} user - Owner user object
 * @returns {Object|null} Sanitized user object
 */
export function presentOwnerUser(user) {
    return sanitizeOwnerUser(user);
}

