import { DataTypes, Model } from 'sequelize';

export class OwnerSession extends Model {}

export function initOwnerSessionModel(sequelize) {
    OwnerSession.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            ownerUserId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'owner_user_id'
            },
            refreshTokenHash: {
                type: DataTypes.STRING(128),
                allowNull: false,
                unique: true,
                field: 'refresh_token_hash'
            },
            userAgent: {
                type: DataTypes.STRING(255),
                allowNull: true,
                field: 'user_agent'
            },
            ipAddress: {
                type: DataTypes.STRING(64),
                allowNull: true,
                field: 'ip_address'
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expires_at'
            },
            revokedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'revoked_at'
            }
        },
        {
            sequelize,
            modelName: 'OwnerSession',
            tableName: 'owner_sessions'
        }
    );

    return OwnerSession;
}

