'use strict';

const tableName = 'tenant_email_verifications';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(tableName, {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            email: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            otp_hash: {
                type: Sequelize.STRING(128),
                allowNull: false
            },
            otp_sent_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            otp_expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            is_otp_used: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            verified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex(tableName, ['user_id'], {
            name: 'tenant_email_verifications_user_id_idx'
        });

        await queryInterface.addIndex(tableName, ['email'], {
            name: 'tenant_email_verifications_email_idx'
        });

        await queryInterface.addIndex(tableName, ['otp_expires_at'], {
            name: 'tenant_email_verifications_otp_expires_at_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable(tableName);
    }
};

