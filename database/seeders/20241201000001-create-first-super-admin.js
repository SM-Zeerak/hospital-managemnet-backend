import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export default {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        await queryInterface.bulkInsert('super_admins', [
            {
                id: randomUUID(),
                email: 'admin@guard.com',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'super-admin',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('super_admins', {
            email: 'admin@guard.com'
        });
    }
};

