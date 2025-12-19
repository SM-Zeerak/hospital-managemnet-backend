export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('super_admins', {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('super-admin', 'admin'),
                defaultValue: 'super-admin',
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_login_ip: {
                type: Sequelize.STRING,
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

        // Create index on email
        await queryInterface.addIndex('super_admins', ['email'], {
            unique: true,
            name: 'super_admins_email_unique'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('super_admins');
    }
};

