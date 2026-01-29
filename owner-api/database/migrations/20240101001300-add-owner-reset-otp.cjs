'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('owner_password_resets', 'otp_hash', {
            type: Sequelize.STRING(128),
            allowNull: true
        });

        await queryInterface.addColumn('owner_password_resets', 'otp_sent_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: queryInterface.sequelize.literal('NOW()')
        });

        await queryInterface.addColumn('owner_password_resets', 'otp_expires_at', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('owner_password_resets', 'is_otp_used', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('owner_password_resets', 'otp_hash');
        await queryInterface.removeColumn('owner_password_resets', 'otp_sent_at');
        await queryInterface.removeColumn('owner_password_resets', 'otp_expires_at');
        await queryInterface.removeColumn('owner_password_resets', 'is_otp_used');
    }
};

