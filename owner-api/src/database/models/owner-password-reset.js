import { DataTypes, Model } from 'sequelize';

export class OwnerPasswordReset extends Model {}

export function initOwnerPasswordResetModel(sequelize) {
    OwnerPasswordReset.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            ownerUserId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'owner_user_id'
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
            modelName: 'OwnerPasswordReset',
            tableName: 'owner_password_resets'
        }
    );

    return OwnerPasswordReset;
}


