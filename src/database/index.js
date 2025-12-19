import 'dotenv/config';
import { Sequelize } from 'sequelize';

if (!process.env.PG_URL) {
    throw new Error('PG_URL environment variable is required. Please check your .env file.');
}

const connection = new Sequelize(process.env.PG_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        underscored: true,
        timestamps: true
    }
});

export async function initDatabase() {
    try {
        await connection.authenticate();
        console.log('Database connection established successfully.');
        return connection;
    } catch (error) {
        console.error('Database connection failed', error);
        throw error;
    }
}

export { connection };

