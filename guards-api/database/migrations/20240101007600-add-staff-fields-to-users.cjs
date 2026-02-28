'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Drop staff table if it exists (we store everything in users now)
        try {
            await queryInterface.dropTable('staff');
        } catch (e) {
            // table may not exist
        }

        await queryInterface.addColumn('users', 'staff_code', {
            type: Sequelize.STRING(80),
            allowNull: true
        });
        await queryInterface.addColumn('users', 'personal_info', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: {}
        });
        await queryInterface.addColumn('users', 'qualification_info', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: []
        });
        await queryInterface.addColumn('users', 'experience_info', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: []
        });
        await queryInterface.addColumn('users', 'salary', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
        });
        await queryInterface.addColumn('users', 'image_url', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'cloudinary_public_id', {
            type: Sequelize.STRING(120),
            allowNull: true
        });
        await queryInterface.addColumn('users', 'cloudinary_resource_type', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
        await queryInterface.addColumn('users', 'rfid_card_number', {
            type: Sequelize.STRING(80),
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('users', 'staff_code');
        await queryInterface.removeColumn('users', 'personal_info');
        await queryInterface.removeColumn('users', 'qualification_info');
        await queryInterface.removeColumn('users', 'experience_info');
        await queryInterface.removeColumn('users', 'salary');
        await queryInterface.removeColumn('users', 'image_url');
        await queryInterface.removeColumn('users', 'cloudinary_public_id');
        await queryInterface.removeColumn('users', 'cloudinary_resource_type');
        await queryInterface.removeColumn('users', 'rfid_card_number');
    }
};
