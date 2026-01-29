'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('vps_nodes', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false,
                unique: true
            },
            region: {
                type: Sequelize.STRING(60),
                allowNull: false
            },
            ip_address: {
                type: Sequelize.STRING(60),
                allowNull: false
            },
            capacity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            health: {
                type: Sequelize.STRING(40),
                allowNull: false,
                defaultValue: 'unknown'
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

        const tenantTable = await queryInterface.describeTable('tenants');
        if (!tenantTable.vps_node_id) {
            await queryInterface.addColumn('tenants', 'vps_node_id', {
                type: Sequelize.UUID,
                allowNull: true
            });
        }

        await queryInterface.addConstraint('tenants', {
            fields: ['vps_node_id'],
            type: 'foreign key',
            name: 'tenants_vps_node_id_fkey',
            references: {
                table: 'vps_nodes',
                field: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.createTable('provisioning_audit', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'tenants',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            step: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            status: {
                type: Sequelize.STRING(40),
                allowNull: false,
                defaultValue: 'pending'
            },
            payload: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            error: {
                type: Sequelize.TEXT,
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable('provisioning_audit');
        await queryInterface.removeConstraint('tenants', 'tenants_vps_node_id_fkey').catch(() => {});
        await queryInterface.dropTable('vps_nodes');
    }
};
