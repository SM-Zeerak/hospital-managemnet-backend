import jwt from 'jsonwebtoken';
import { generateSecureToken } from '../../../utils/encryption.js';

export class AuthService {
    constructor(db, jwtConfig) {
        this.db = db;
        this.jwtConfig = jwtConfig;
    }

    async login(email, password, ipAddress) {
        const { SuperAdmin } = this.db.models;

        // Find super admin by email
        const superAdmin = await SuperAdmin.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!superAdmin) {
            throw new Error('Invalid email or password');
        }

        if (!superAdmin.isActive) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await superAdmin.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        await superAdmin.update({
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress
        });

        // Generate tokens
        const tokens = this.generateTokens(superAdmin);

        return {
            superAdmin: superAdmin.toJSON(),
            ...tokens
        };
    }

    generateTokens(superAdmin) {
        const payload = {
            id: superAdmin.id,
            email: superAdmin.email,
            role: superAdmin.role,
            type: 'super-admin'
        };

        // Generate access token
        const accessToken = jwt.sign(
            payload,
            this.jwtConfig.accessSecret,
            {
                expiresIn: this.jwtConfig.accessTtl
            }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            { ...payload, tokenId: generateSecureToken() },
            this.jwtConfig.refreshSecret,
            {
                expiresIn: this.jwtConfig.refreshTtl
            }
        );

        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer'
        };
    }

    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, this.jwtConfig.refreshSecret);
            
            if (decoded.type !== 'super-admin') {
                throw new Error('Invalid token type');
            }

            const { SuperAdmin } = this.db.models;
            const superAdmin = await SuperAdmin.findByPk(decoded.id);

            if (!superAdmin || !superAdmin.isActive) {
                throw new Error('Super admin not found or inactive');
            }

            // Generate new tokens
            return this.generateTokens(superAdmin);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }
            throw new Error('Invalid refresh token');
        }
    }

    async logout(superAdminId) {
        // In a real app, you might want to blacklist the token
        // For now, we'll just return success
        return { success: true, message: 'Logged out successfully' };
    }
}

