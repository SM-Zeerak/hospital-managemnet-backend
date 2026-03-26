'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove foreign key/index + column from roles if present
        const roleDesc = await queryInterface.describeTable('roles');
        if (roleDesc.department_id) {
            try {
                await queryInterface.removeIndex('roles', 'roles_department_id_idx');
            } catch (e) {
                // ignore if index does not exist
            }
            await queryInterface.removeColumn('roles', 'department_id');
        }

        // Remove department_id from users if present
        const userDesc = await queryInterface.describeTable('users');
        if (userDesc.department_id) {
            await queryInterface.removeColumn('users', 'department_id');
        }

        // Drop departments table if it exists
        try {
            await queryInterface.dropTable('departments');
        } catch (e) {
            // table might already be gone; ignore
        }
    },

    async down(queryInterface, Sequelize) {
        // Recreate departments table with minimal structure if needed
        const tables = await queryInterface.showAllTables();
        if (!tables.includes('departments')) {
            await queryInterface.createTable('departments', {
                id: {
                    type: Sequelize.DataTypes.UUID,
                    primaryKey: true,
                    allowNull: false
                },
                name: {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: false
                },
                description: {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: true
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

        // Re-add department_id to users (nullable, no FK)
        const userDesc = await queryInterface.describeTable('users');
        if (!userDesc.department_id) {
            await queryInterface.addColumn('users', 'department_id', {
                type: Sequelize.DataTypes.UUID,
                allowNull: true
            });
        }

        // Re-add department_id to roles (nullable, no FK)
        const roleDesc = await queryInterface.describeTable('roles');
        if (!roleDesc.department_id) {
            await queryInterface.addColumn('roles', 'department_id', {
                type: Sequelize.DataTypes.UUID,
                allowNull: true
            });
        }
    }
};

