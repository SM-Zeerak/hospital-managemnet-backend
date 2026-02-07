import bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

const TOKEN_HASH_ALGO = 'sha256';
const OTP_LENGTH = Number(process.env.TENANT_PASSWORD_RESET_OTP_LENGTH || 6);
const OTP_TTL_MINUTES = Number(process.env.TENANT_PASSWORD_RESET_OTP_TTL || 10);
const EMAIL_VERIFICATION_OTP_TTL_MINUTES = Number(process.env.TENANT_EMAIL_VERIFICATION_OTP_TTL || 10);

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
 * @param {string|null} tenantId - Tenant ID
 * @returns {Object} JWT payload
 */
export function buildAuthPayload(source, tenantId) {
    const departmentName = typeof source.department === 'string'
        ? source.department
        : source.department?.name || null;

    const resolvedTenantId = source.tenantId || tenantId || null;

    return {
        userId: source.userId || source.id,
        email: source.email,
        firstName: source.firstName,
        lastName: source.lastName,
        department: departmentName,
        roles: source.roles || [],
        permissions: source.permissions || [],
        tenantId: resolvedTenantId
    };
}

/**
 * Signs access and refresh tokens
 * @param {Object} app - Fastify app instance
 * @param {Object} payload - JWT payload
 * @returns {Object} Access and refresh tokens
 */
export function signTokens(app, payload) {
    const config = app.jwtConfig || {};
    const { accessSecret, refreshSecret, accessTtl, refreshTtl } = config;
    
    if (!accessSecret || !refreshSecret) {
        throw new Error('JWT secrets not configured. accessSecret and refreshSecret are required.');
    }
    
    if (!accessTtl || !refreshTtl) {
        throw new Error('JWT TTL not configured. accessTtl and refreshTtl are required.');
    }
    
    // Use jsonwebtoken directly to support different secrets for access and refresh tokens
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessTtl });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshTtl });
    
    const accessDecoded = jwt.decode(accessToken);
    const refreshDecoded = jwt.decode(refreshToken);
    
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
    const { refreshSecret } = app.jwtConfig || {};
    return jwt.verify(token, refreshSecret);
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
 * Derives OTP expiry date for password reset
 * @returns {Date} OTP expiry date
 */
export function derivePasswordResetOtpExpiry() {
    return dayjs().add(OTP_TTL_MINUTES, 'minute').toDate();
}

/**
 * Derives OTP expiry date for email verification
 * @returns {Date} OTP expiry date
 */
export function deriveEmailVerificationOtpExpiry() {
    return dayjs().add(EMAIL_VERIFICATION_OTP_TTL_MINUTES, 'minute').toDate();
}

/**
 * Computes roles and permissions from user associations (similar to users/utils.js)
 * @param {Object} user - User object with roleEntities association
 * @returns {Object} Object with roles and permissions arrays
 */
export function computeTenantUserRolesAndPermissions(user) {
    if (user.roles && Array.isArray(user.roles) && user.permissions && Array.isArray(user.permissions)) {
        return {
            roles: user.roles,
            permissions: user.permissions
        };
    }
    
    // Otherwise, compute from associations
    const roles = user.roleEntities?.map(r => r.name) || [];
    const permissions = new Set();
    
    user.roleEntities?.forEach(role => {
        role.permissionEntities?.forEach(perm => {
            permissions.add(perm.key);
        });
    });
    
    return {
        roles,
        permissions: Array.from(permissions)
    };
}

/**
 * Sanitizes tenant user by removing sensitive fields
 * @param {Object} user - Tenant user object
 * @returns {Object|null} Sanitized user object
 */
export function sanitizeTenantUser(user) {
    if (!user) {
        return null;
    }
    const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;
    delete plain.passwordHash;
    delete plain.password;
    return plain;
}

/**
 * Presents tenant user (sanitized) with roles and permissions
 * @param {Object} user - Tenant user object
 * @returns {Object|null} Sanitized user object with roles and permissions
 */
export function presentTenantUser(user) {
    if (!user) return null;
    
    const { roles, permissions } = computeTenantUserRolesAndPermissions(user);
    const userObj = sanitizeTenantUser(user);
    
    return {
        ...userObj,
        roles,
        permissions
    };
}

