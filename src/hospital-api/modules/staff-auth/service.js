import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateSecureToken } from '../../../utils/encryption.js';

export class StaffAuthService {
    constructor(db, jwtConfig) {
        this.db = db;
        this.jwtConfig = jwtConfig;
    }

    async login(email, password, ipAddress) {
        const { Staff } = this.db.models;

        // Find staff by email
        const staff = await Staff.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!staff) {
            throw new Error('Invalid email or password');
        }

        if (!staff.isActive) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await staff.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        await staff.update({
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress
        });

        // Generate tokens
        const tokens = this.generateTokens(staff);

        return {
            staff: staff.toJSON(),
            ...tokens
        };
    }

    generateTokens(staff) {
        const payload = {
            id: staff.id,
            email: staff.email,
            role: staff.role,
            type: 'staff',
            permissions: staff.permissions || []
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
            
            if (decoded.type !== 'staff') {
                throw new Error('Invalid token type');
            }

            const { Staff } = this.db.models;
            const staff = await Staff.findByPk(decoded.id);

            if (!staff || !staff.isActive) {
                throw new Error('Staff not found or inactive');
            }

            // Generate new tokens
            return this.generateTokens(staff);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }
            throw new Error('Invalid refresh token');
        }
    }

    async forgotPassword(email) {
        const { Staff } = this.db.models;

        const staff = await Staff.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!staff) {
            // Don't reveal if email exists for security
            return { message: 'If email exists, password reset link has been sent' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

        await staff.update({
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires
        });

        // In production, send email with reset link
        // For now, we'll return the token (remove in production)
        return {
            message: 'Password reset token generated',
            resetToken: resetToken, // Remove this in production, send via email instead
            expiresAt: resetExpires
        };
    }

    async resetPassword(token, newPassword) {
        const { Staff } = this.db.models;

        const staff = await Staff.findOne({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    [this.db.sequelize.Op.gt]: new Date()
                }
            }
        });

        if (!staff) {
            throw new Error('Invalid or expired reset token');
        }

        // Update password and clear reset token
        await staff.update({
            password: newPassword,
            passwordResetToken: null,
            passwordResetExpires: null
        });

        return { message: 'Password reset successfully' };
    }

    async changePassword(staffId, currentPassword, newPassword) {
        const { Staff } = this.db.models;

        const staff = await Staff.findByPk(staffId);
        if (!staff) {
            throw new Error('Staff not found');
        }

        // Verify current password
        const isPasswordValid = await staff.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        await staff.update({
            password: newPassword
        });

        return { message: 'Password changed successfully' };
    }

    async logout(staffId) {
        // In a real app, you might want to blacklist the token
        // For now, we'll just return success
        return { success: true, message: 'Logged out successfully' };
    }
}

