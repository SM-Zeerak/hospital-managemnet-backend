import 'dotenv/config';
import pg from 'pg';

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
            // eslint-disable-next-line no-console
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
    const envSuffix = env === 'development' ? '' : `_${env.toUpperCase()}`;
    const envVar = `TENANT_PG_URL${envSuffix}`;
    const url = process.env[envVar] || process.env.TENANT_PG_URL || null;

    if (url) {
        try {
            await ensureDatabaseExists(url);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Failed to ensure tenant database for ${env}:`, error.message);
        }
    } else {
        // eslint-disable-next-line no-console
        console.warn(`TENANT_PG_URL not configured for ${env}`);
    }

    config[env] = {
        ...base,
        url
    };
}

export default config;

