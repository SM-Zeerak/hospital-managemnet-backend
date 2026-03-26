'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add role_id (single main role for the user)
        await queryInterface.addColumn('users', 'role_id', {
            type: Sequelize.DataTypes.UUID,
            allowNull: true
        });

        // Add permission_ids (list of permission IDs directly on user)
        await queryInterface.addColumn('users', 'permission_ids', {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.UUID),
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('users', 'permission_ids');
        await queryInterface.removeColumn('users', 'role_id');
    }
};

