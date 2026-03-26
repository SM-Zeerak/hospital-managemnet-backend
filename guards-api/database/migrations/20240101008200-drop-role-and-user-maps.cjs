'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // Drop mapping tables that are no longer needed
        try {
            await queryInterface.dropTable('user_role_map');
        } catch (e) {
            // ignore if already dropped
        }

        try {
            await queryInterface.dropTable('role_permission_map');
        } catch (e) {
            // ignore if already dropped
        }
    },

    async down(queryInterface, Sequelize) {
        // Recreate minimal versions of the mapping tables if we ever rollback
        const tables = await queryInterface.showAllTables();

        if (!tables.includes('user_role_map')) {
            await queryInterface.createTable('user_role_map', {
                id: {
                    type: Sequelize.DataTypes.UUID,
                    primaryKey: true,
                    allowNull: false
                },
                user_id: {
                    type: Sequelize.DataTypes.UUID,
                    allowNull: false
                },
                role_id: {
                    type: Sequelize.DataTypes.UUID,
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DataTypes.DATE,
                    allowNull: false
                },
                updated_at: {
                    type: Sequelize.DataTypes.DATE,
                    allowNull: false
                }
            });
        }

        if (!tables.includes('role_permission_map')) {
            await queryInterface.createTable('role_permission_map', {
                id: {
                    type: Sequelize.DataTypes.UUID,
                    primaryKey: true,
                    allowNull: false
                },
                role_id: {
                    type: Sequelize.DataTypes.UUID,
                    allowNull: false
                },
                permission_id: {
                    type: Sequelize.DataTypes.UUID,
                    allowNull: false
                },
                created_at: {
                    type: Sequelize.DataTypes.DATE,
                    allowNull: false
                },
                updated_at: {
                    type: Sequelize.DataTypes.DATE,
                    allowNull: false
                }
            });
        }
    }
};

