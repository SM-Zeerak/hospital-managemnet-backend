import { DataTypes, Model } from 'sequelize';

export class TenantEmailVerification extends Model {}

export function initTenantEmailVerificationModel(sequelize) {
    TenantEmailVerification.init(
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
            email: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            otpHash: {
                type: DataTypes.STRING(128),
                allowNull: false,
                field: 'otp_hash'
            },
            otpSentAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'otp_sent_at'
            },
            otpExpiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'otp_expires_at'
            },
            isOtpUsed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_otp_used'
            },
            verifiedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'verified_at'
            }
        },
        {
            sequelize,
            modelName: 'TenantEmailVerification',
            tableName: 'tenant_email_verifications'
        }
    );

    return TenantEmailVerification;
}

