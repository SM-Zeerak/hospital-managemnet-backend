'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('tenants', 'sync_webhook_url', {
            type: Sequelize.STRING(255),
            allowNull: true
        });
        await queryInterface.addIndex('tenants', ['sync_webhook_url'], {
            name: 'tenants_sync_webhook_url_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('tenants', 'tenants_sync_webhook_url_idx');
        await queryInterface.removeColumn('tenants', 'sync_webhook_url');
    }
};
