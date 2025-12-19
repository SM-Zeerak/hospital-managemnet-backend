export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('staff', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            department: {
                type: Sequelize.STRING,
                allowNull: true
            },
            position: {
                type: Sequelize.STRING,
                allowNull: true
            },
            employee_id: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true
            },
            role: {
                type: Sequelize.ENUM('doctor', 'nurse', 'admin', 'receptionist', 'pharmacist', 'lab_technician', 'other'),
                defaultValue: 'other',
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            email_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            password_reset_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            password_reset_expires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_login_ip: {
                type: Sequelize.STRING,
                allowNull: true
            },
            permissions: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
                allowNull: false
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

        // Create indexes
        await queryInterface.addIndex('staff', ['email'], {
            unique: true,
            name: 'staff_email_unique'
        });

        await queryInterface.addIndex('staff', ['employee_id'], {
            unique: true,
            name: 'staff_employee_id_unique'
        });

        await queryInterface.addIndex('staff', ['role'], {
            name: 'staff_role_index'
        });

        await queryInterface.addIndex('staff', ['department'], {
            name: 'staff_department_index'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('staff');
    }
};

