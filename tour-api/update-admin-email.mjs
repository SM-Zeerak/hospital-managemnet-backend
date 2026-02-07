import pg from 'pg';

const client = new pg.Client('postgres://postgres:Syed1234@localhost:5432/tour_nooritransport');

async function updateEmail() {
    try {
        await client.connect();

        // Update email
        const result = await client.query(
            "UPDATE users SET email = 'admin@nooritransport.com' WHERE email = 'admin@noori_transport.com'"
        );

        console.log(`✅ Updated ${result.rowCount} user(s)`);
        console.log('New Email: admin@nooritransport.com');

        await client.end();
    } catch (error) {
        console.error('Error:', error.message);
        await client.end();
        process.exit(1);
    }
}

updateEmail();
