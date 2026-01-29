import { DataTypes, Model } from 'sequelize';

export class TenantPasswordReset extends Model {}

export function initTenantPasswordResetModel(sequelize) {
    TenantPasswordReset.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'user_id'
            },
            token: {
                type: DataTypes.STRING(120),
                allowNull: false,
                unique: true
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expires_at'
            },
            otpHash: {
                type: DataTypes.STRING(128),
                allowNull: true,
                field: 'otp_hash'
            },
            otpSentAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'otp_sent_at'
            },
            otpExpiresAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'otp_expires_at'
            },
            isOtpUsed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_otp_used'
            },
            usedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'used_at'
            }
        },
        {
            sequelize,
            modelName: 'TenantPasswordReset',
            tableName: 'tenant_password_resets'
        }
    );

    return TenantPasswordReset;
}

