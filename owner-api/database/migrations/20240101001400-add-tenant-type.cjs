'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('tenants', 'type', {
            type: Sequelize.ENUM('HOSPITAL', 'SCHOOL', 'GUARD'),
            allowNull: false,
            defaultValue: 'HOSPITAL'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('tenants', 'type');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tenants_type";');
    }
};
