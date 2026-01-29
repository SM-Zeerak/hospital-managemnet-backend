'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('template_audits', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            template_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'templates',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            version: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            change_type: {
                type: Sequelize.STRING(80),
                allowNull: false
            },
            diff: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {}
            },
            triggered_by: {
                type: Sequelize.STRING(150),
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

        await queryInterface.addIndex('template_audits', ['template_id']);
        await queryInterface.addIndex('template_audits', ['change_type']);
        await queryInterface.addIndex('template_audits', ['version']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('template_audits');
    }
};


