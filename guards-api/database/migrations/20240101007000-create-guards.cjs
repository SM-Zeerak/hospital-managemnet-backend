'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('guards', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            guard_id: {
                type: Sequelize.STRING(80),
                allowNull: true,
                comment: 'Guard badge / registration ID'
            },
            date_of_registration: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            father_name: {
                type: Sequelize.STRING(120),
                allowNull: true
            },
            date_of_birth: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            education: {
                type: Sequelize.STRING(120),
                allowNull: true
            },
            cnic: {
                type: Sequelize.STRING(24),
                allowNull: true
            },
            current_address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            permanent_address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            contact_no1: {
                type: Sequelize.STRING(24),
                allowNull: true
            },
            contact_no2: {
                type: Sequelize.STRING(24),
                allowNull: true
            },
            salary: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true
            },
            police_district_current: {
                type: Sequelize.STRING(120),
                allowNull: true
            },
            police_district_permanent: {
                type: Sequelize.STRING(120),
                allowNull: true
            },
            same_address: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            language: {
                type: Sequelize.STRING(60),
                allowNull: true
            },
            married: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            emergency_contact: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null
            },
            services: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null
            },
            questions: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: null
            },
            references: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: []
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

        await queryInterface.addIndex('guards', ['tenant_id'], { name: 'guards_tenant_id_idx' });
        await queryInterface.addIndex('guards', ['guard_id'], { name: 'guards_guard_id_idx' });
        await queryInterface.addIndex('guards', ['name'], { name: 'guards_name_idx' });
        await queryInterface.addIndex('guards', ['cnic'], { name: 'guards_cnic_idx' });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('guards');
    }
};
