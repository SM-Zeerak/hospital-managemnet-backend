import pg from 'pg';
import { v4 as uuid } from 'uuid';

const client = new pg.Client('postgres://postgres:Syed1234@localhost:5432/dynamix_zone');

async function registerTenant() {
    try {
        await client.connect();

        // Get a plan ID
        const planResult = await client.query('SELECT id FROM plans WHERE is_active = true LIMIT 1');
        const planId = planResult.rows[0]?.id || null;

        // Check if tenant already exists
        const existingTenant = await client.query(
            'SELECT id FROM tenants WHERE tenant_db_name = $1',
            ['tour_nooritransport']
        );

        if (existingTenant.rows.length > 0) {
            console.log('✅ Tenant already registered!');
            console.log('TENANT_ID:', existingTenant.rows[0].id);
            await client.end();
            return;
        }

        // Register new tenant
        const tenantId = uuid();
        await client.query(
            `INSERT INTO tenants (id, company_name, subdomain, tenant_db_name, tenant_region, status, plan_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [tenantId, 'Noori Transport', 'noori_transport', 'tour_nooritransport', 'local', 'active', planId]
        );

        console.log('✅ Tenant registered successfully!');
        console.log('');
        console.log('Company: Noori Transport');
        console.log('Database: tour_nooritransport');
        console.log('TENANT_ID:', tenantId);
        console.log('');
        console.log('Update your tour-api/.env file with:');
        console.log(`TENANT_ID=${tenantId}`);

        await client.end();
    } catch (error) {
        console.error('Error:', error.message);
        await client.end();
        process.exit(1);
    }
}

registerTenant();
