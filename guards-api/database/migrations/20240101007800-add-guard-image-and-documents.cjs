'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('guards', 'image_url', {
            type: Sequelize.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('guards', 'image_cloudinary_public_id', {
            type: Sequelize.STRING(120),
            allowNull: true
        });
        await queryInterface.addColumn('guards', 'image_cloudinary_resource_type', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
        await queryInterface.addColumn('guards', 'documents', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: []
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('guards', 'image_url');
        await queryInterface.removeColumn('guards', 'image_cloudinary_public_id');
        await queryInterface.removeColumn('guards', 'image_cloudinary_resource_type');
        await queryInterface.removeColumn('guards', 'documents');
    }
};
