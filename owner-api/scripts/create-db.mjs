#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';

const dbUrl = process.env.OWNER_PG_URL;

if (!dbUrl) {
    console.error('❌ ERROR: OWNER_PG_URL not set in .env file');
    process.exit(1);
}

const connection = new URL(dbUrl);
const databaseName = connection.pathname.replace(/^\//, '');

if (!databaseName) {
    console.error('❌ ERROR: Database name missing from OWNER_PG_URL');
    process.exit(1);
}

connection.pathname = '/postgres';

const client = new pg.Client({
    connectionString: connection.toString()
});

try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');
    
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    
    if (result.rowCount === 0) {
        await client.query(`CREATE DATABASE "${databaseName}"`);
        console.log(`✅ Created database: ${databaseName}`);
    } else {
        console.log(`ℹ️  Database already exists: ${databaseName}`);
    }
    
    await client.end();
    console.log('✅ Database setup complete!\n');
} catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
}
