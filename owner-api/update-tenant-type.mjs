import pg from 'pg';

const client = new pg.Client('postgres://postgres:Syed1234@localhost:5432/dynamix_zone');

async function updateAndVerify() {
    try {
        await client.connect();

        // Update type
        await client.query("UPDATE tenants SET type = 'TOUR' WHERE subdomain = 'noori_transport'");
        console.log('✅ Updated tenant type to TOUR');

        // Verify
        const res = await client.query("SELECT * FROM tenants WHERE subdomain = 'noori_transport'");
        console.log('\n✅ Tenant Record Found:');
        console.log('--------------------------------------------------');
        console.log(res.rows[0]);
        console.log('--------------------------------------------------');

        await client.end();
    } catch (error) {
        console.error('Error:', error.message);
        await client.end();
    }
}

updateAndVerify();
