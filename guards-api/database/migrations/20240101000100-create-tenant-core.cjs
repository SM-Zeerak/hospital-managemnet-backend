'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('departments', {
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
            description: {
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

        await queryInterface.createTable('roles', {
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
            description: {
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

        await queryInterface.createTable('permissions', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            key: {
                type: Sequelize.STRING(160),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            description: {
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

        await queryInterface.createTable('role_permission_map', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            permission_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'permissions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        await queryInterface.addConstraint('role_permission_map', {
            fields: ['role_id', 'permission_id'],
            type: 'unique',
            name: 'role_permission_unique'
        });

        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            email: {
                type: Sequelize.STRING(120),
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            first_name: {
                type: Sequelize.STRING(80),
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING(80),
                allowNull: false
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
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'active'
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

        await queryInterface.addIndex('users', ['tenant_id'], {
            name: 'users_tenant_id_idx'
        });

        await queryInterface.createTable('user_role_map', {
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
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        await queryInterface.addConstraint('user_role_map', {
            fields: ['user_id', 'role_id'],
            type: 'unique',
            name: 'user_role_unique'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('user_role_map');
        await queryInterface.dropTable('users');
        await queryInterface.dropTable('role_permission_map');
        await queryInterface.dropTable('permissions');
        await queryInterface.dropTable('roles');
        await queryInterface.dropTable('departments');
    }
};
