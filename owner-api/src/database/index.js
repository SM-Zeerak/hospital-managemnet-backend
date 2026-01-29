import { Sequelize } from 'sequelize';

const connection = new Sequelize(process.env.OWNER_PG_URL, {
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
        return connection;
    } catch (error) {
        console.error('Owner DB connection failed', error);
        throw error;
    }
}

export { connection };
