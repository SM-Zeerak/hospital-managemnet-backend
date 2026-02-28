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
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: false
            },
            department_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'departments', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'roles', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            staff_code: {
                type: Sequelize.STRING(80),
                allowNull: true,
                comment: 'e.g. STF-001 from form staffId'
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
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true
            },
            image_url: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            cloudinary_public_id: {
                type: Sequelize.STRING(120),
                allowNull: true
            },
            cloudinary_resource_type: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            rfid_card_number: {
                type: Sequelize.STRING(80),
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
        await queryInterface.addConstraint('staff', {
            fields: ['user_id'],
            type: 'unique',
            name: 'staff_user_id_unique'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('staff');
    }
};
