'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tenant_sessions', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: queryInterface.sequelize.literal('gen_random_uuid()')
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            refresh_token_hash: {
                type: Sequelize.STRING(128),
                allowNull: false,
                unique: true
            },
            user_agent: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING(64),
                allowNull: true
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: queryInterface.sequelize.literal('NOW()')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: queryInterface.sequelize.literal('NOW()')
            }
        });

        await queryInterface.addIndex('tenant_sessions', ['user_id'], {
            name: 'tenant_sessions_user_id_idx'
        });

        await queryInterface.addIndex('tenant_sessions', ['refresh_token_hash'], {
            name: 'tenant_sessions_refresh_token_hash_idx',
            unique: true
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('tenant_sessions');
    }
};

