'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('staff', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            department_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'departments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            personal_info: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {}
            },
            qualification_info: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: []
            },
            experience_info: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: []
            },
            salary: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0
            },
            rfid_card_number: {
                type: Sequelize.STRING(50),
                allowNull: true,
                unique: true
            },
            image_url: {
                type: Sequelize.STRING(255),
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

        await queryInterface.addIndex('staff', ['user_id'], { name: 'staff_user_id_idx' });
        await queryInterface.addIndex('staff', ['tenant_id'], { name: 'staff_tenant_id_idx' });
        await queryInterface.addIndex('staff', ['rfid_card_number'], { name: 'staff_rfid_card_number_idx' });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('staff');
    }
};
