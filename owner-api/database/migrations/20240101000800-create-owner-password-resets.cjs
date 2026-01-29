'use strict';

const tableName = 'owner_password_resets';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable(tableName, {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            owner_user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'owner_users',
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

        await queryInterface.addIndex(tableName, ['owner_user_id'], {
            name: 'owner_password_resets_owner_user_id_idx'
        });

        await queryInterface.addIndex(tableName, ['expires_at'], {
            name: 'owner_password_resets_expires_at_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable(tableName);
    }
};


