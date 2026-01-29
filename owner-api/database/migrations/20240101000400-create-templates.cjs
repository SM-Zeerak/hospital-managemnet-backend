'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('templates', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            key: {
                type: Sequelize.STRING(120),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            type: {
                type: Sequelize.STRING(60),
                allowNull: false,
                defaultValue: 'email'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            metadata: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            version: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable('templates');
    }
};
