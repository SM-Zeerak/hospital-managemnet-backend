'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('drivers', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            uid: {
                type: Sequelize.STRING(128),
                allowNull: false,
                unique: true
            },
            driver_id: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            salary: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'Active'
            },
            email: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            aqama: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            mobile: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            registration_date: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            iqama_expiry: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            experience: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            image_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex('drivers', ['tenant_id'], {
            name: 'drivers_tenant_id_idx'
        });

        await queryInterface.addIndex('drivers', ['uid'], {
            name: 'drivers_uid_idx'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('drivers');
    }
};
