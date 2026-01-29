require('dotenv/config');
const pg = require('pg');

const base = {
    dialect: 'postgres',
    define: {
        underscored: true,
        timestamps: true
    },
    migrationStorageTableName: 'sequelize_meta'
};

async function ensureDatabaseExists(url) {
    if (!url) {
        throw new Error('Database connection URL not provided');
    }

    const connection = new URL(url);
    const databaseName = connection.pathname.replace(/^\//, '');

    if (!databaseName) {
        throw new Error('Database name missing from connection URL');
    }

    connection.pathname = '/postgres';

    const client = new pg.Client({
        connectionString: connection.toString()
    });

    await client.connect();
    try {
        const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE "${databaseName}"`);
            console.log(`Created database ${databaseName}`);
        }
    } finally {
        await client.end();
    }

    return url;
}

const environments = ['development', 'test', 'production'];
const config = {};

for (const env of environments) {
    const envVar = `OWNER_PG_URL${env === 'development' ? '' : `_${env.toUpperCase()}`}`;
    const url = process.env[envVar] || process.env.OWNER_PG_URL || null;

    config[env] = {
        ...base,
        url
    };
}

// Note: Database creation happens in the application code, not here
// Sequelize CLI just needs the config structure

module.exports = config;
