#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';

const dbUrl = process.env.OWNER_PG_URL;

if (!dbUrl) {
    console.error('❌ ERROR: OWNER_PG_URL not set in .env file');
    process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl });

try {
    await client.connect();
    
    const result = await client.query(
        `SELECT id, company_name, tenant_db_name FROM tenants ORDER BY created_at`
    );

    if (result.rows.length === 0) {
        console.log('No tenants found. Run seeders first: pnpm run db:seed');
    } else {
        console.log('\n📋 Available Hospitals (Tenants):');
        console.log('================================\n');
        
        for (const tenant of result.rows) {
            console.log(`🏥 ${tenant.company_name}`);
            console.log(`   Database: ${tenant.tenant_db_name}`);
            console.log(`   TENANT_ID: ${tenant.id}`);
            console.log(`\n   To seed this hospital:`);
            console.log(`   cd ../tenant-api`);
            console.log(`   node scripts/seed-hospital.mjs --tenantId ${tenant.id} --dbName ${tenant.tenant_db_name}`);
            console.log('');
        }
    }

    await client.end();
} catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
}
