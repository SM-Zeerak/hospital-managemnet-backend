'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            'CREATE UNIQUE INDEX users_tenant_id_staff_code_unique ON users (tenant_id, staff_code) WHERE staff_code IS NOT NULL;'
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query('DROP INDEX IF EXISTS users_tenant_id_staff_code_unique;');
    }
};
