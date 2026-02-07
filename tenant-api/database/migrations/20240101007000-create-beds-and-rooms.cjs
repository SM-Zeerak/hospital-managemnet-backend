'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('rooms', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'active'
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

        await queryInterface.createTable('beds', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            quality: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'available'
            },
            rate: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            room_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'rooms',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
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

        await queryInterface.addIndex('beds', ['room_id'], {
            name: 'beds_room_id_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('beds');
        await queryInterface.dropTable('rooms');
    }
};
