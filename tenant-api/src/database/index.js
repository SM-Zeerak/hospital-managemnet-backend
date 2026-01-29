import { Sequelize } from 'sequelize';

// Primary database (local) - required for hospital operations
const primaryConnection = new Sequelize(process.env.TENANT_PG_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        underscored: true,
        timestamps: true
    }
});

// Secondary database (online) - optional, used for sync, backup, and external access
let secondaryConnection = null;
if (process.env.TENANT_PG_URL_ONLINE) {
    secondaryConnection = new Sequelize(process.env.TENANT_PG_URL_ONLINE, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            underscored: true,
            timestamps: true
        }
    });
}

export async function initDatabase() {
    const connections = {
        primary: null,
        secondary: null,
        primaryError: null,
        secondaryError: null
    };

    // Initialize primary database (local) - required
    try {
        await primaryConnection.authenticate();
        connections.primary = primaryConnection;
        console.log('✓ Primary database (local) connected successfully');
    } catch (error) {
        connections.primaryError = error;
        console.error('✗ Primary database (local) connection failed:', error.message);
        throw error; // Primary DB is required
    }

    // Initialize secondary database (online) - optional for sync/backup
    if (secondaryConnection) {
        try {
            await secondaryConnection.authenticate();
            connections.secondary = secondaryConnection;
            console.log('✓ Secondary database (online) connected successfully');
        } catch (error) {
            connections.secondaryError = error;
            console.error('✗ Secondary database (online) connection failed:', error.message);
            // Don't throw - online DB is optional (used for sync/backup only)
        }
    } else {
        console.warn('⚠ Secondary database (online) not configured (TENANT_PG_URL_ONLINE not set) - sync/backup unavailable');
    }

    return connections;
}

export { primaryConnection as connection, secondaryConnection };
