'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add 'TOUR' to the enum
        await queryInterface.sequelize.query("ALTER TYPE enum_tenants_type ADD VALUE 'TOUR';");
    },

    async down(queryInterface, Sequelize) {
        // Removing value from enum is complex in Postgres, skipping for now
    }
};
