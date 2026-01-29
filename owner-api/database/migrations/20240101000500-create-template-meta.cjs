'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('template_meta', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            global_version: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.bulkInsert('template_meta', [{
            global_version: 1,
            updated_at: new Date()
        }]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('template_meta');
    }
};
