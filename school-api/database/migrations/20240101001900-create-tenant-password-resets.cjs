'use strict';

const tableName = 'tenant_password_resets';

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
            token: {
                type: Sequelize.STRING(120),
                allowNull: false,
                unique: true
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            otp_hash: {
                type: Sequelize.STRING(128),
                allowNull: true
            },
            otp_sent_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            otp_expires_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            is_otp_used: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            used_at: {
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
            name: 'tenant_password_resets_user_id_idx'
        });

        await queryInterface.addIndex(tableName, ['expires_at'], {
            name: 'tenant_password_resets_expires_at_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable(tableName);
    }
};

