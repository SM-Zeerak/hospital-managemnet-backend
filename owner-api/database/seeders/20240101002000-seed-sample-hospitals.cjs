'use strict';

const { hashSync } = require('bcrypt');
const { v4: uuid } = require('uuid');
const { execSync } = require('child_process');
const pg = require('pg');
const path = require('path');
const fs = require('fs');

function assertTenantApiInstalled(tenantApiPath) {
    // pnpm creates node_modules folder with nested deps; simplest check is dotenv package folder
    const dotenvPkg = path.join(tenantApiPath, 'node_modules', 'dotenv', 'package.json');
    if (!fs.existsSync(dotenvPkg)) {
        throw new Error(
            `tenant-api dependencies are not installed.\n` +
            `Run:\n` +
            `  cd "${tenantApiPath}" && pnpm install\n` +
            `Then re-run:\n` +
            `  cd "${process.cwd()}" && pnpm run db:seed`
        );
    }
}

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // Get a plan ID (use first available plan)
        const plans = await queryInterface.sequelize.query(
            `SELECT id FROM plans WHERE is_active = true LIMIT 1`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        const planId = plans[0]?.id || null;

        // Sample Hospitals (first admin will be created automatically: admin@tenantName.com / Admin1234)
        const hospitals = [
            {
                id: uuid(),
                company_name: 'Abdullah Hospital',
                subdomain: 'abdullah',
                tenant_db_name: 'hospital_abdullah',
                tenant_region: 'local',
                status: 'active',
                plan_id: planId,
                created_at: now,
                updated_at: now
            },
            {
                id: uuid(),
                company_name: 'Ramzan Hospital',
                subdomain: 'ramzan',
                tenant_db_name: 'hospital_ramzan',
                tenant_region: 'local',
                status: 'active',
                plan_id: planId,
                created_at: now,
                updated_at: now
            }
        ];

        // Check for existing tenants
        const existingTenants = await queryInterface.sequelize.query(
            `SELECT tenant_db_name FROM tenants WHERE tenant_db_name IN (:dbNames)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { dbNames: hospitals.map(h => h.tenant_db_name) }
            }
        );
        const existingDbNames = new Set(existingTenants.map(t => t.tenant_db_name));

        const hospitalsToInsert = hospitals.filter(h => !existingDbNames.has(h.tenant_db_name));

        if (hospitalsToInsert.length > 0) {
            await queryInterface.bulkInsert('tenants', hospitalsToInsert);
        }

        // Get the created tenants to return their IDs
        const createdTenants = await queryInterface.sequelize.query(
            `SELECT id, company_name, tenant_db_name FROM tenants WHERE tenant_db_name IN (:dbNames)`,
            {
                type: queryInterface.sequelize.QueryTypes.SELECT,
                replacements: { dbNames: hospitals.map(h => h.tenant_db_name) }
            }
        );

        // Setup each tenant database automatically
        const ownerDbUrl = process.env.OWNER_PG_URL;
        if (!ownerDbUrl) {
            throw new Error('OWNER_PG_URL not configured');
        }

        // Extract base connection info from owner DB URL
        const ownerConnection = new URL(ownerDbUrl);
        // IMPORTANT: use hostname (not host) to avoid duplicating the port
        const baseUrl = `${ownerConnection.protocol}//${ownerConnection.username}:${ownerConnection.password}@${ownerConnection.hostname}:${ownerConnection.port || 5432}`;

        // Get tenant-api path (relative to owner-api)
        const tenantApiPath = path.resolve(__dirname, '../../../tenant-api');
        assertTenantApiInstalled(tenantApiPath);

        console.log('\n✅ Sample Hospitals Created:');
        console.log('================================');

        for (const tenant of createdTenants) {
            const tenantName = tenant.company_name.toLowerCase().replace(/\s+/g, '');
            const adminEmail = `admin@${tenantName}.com`;
            const adminPassword = 'Admin1234';
            
            console.log(`\n🏥 ${tenant.company_name}`);
            console.log(`   Database: ${tenant.tenant_db_name}`);
            console.log(`   TENANT_ID: ${tenant.id}`);

            const tenantDbUrl = `${baseUrl}/${tenant.tenant_db_name}`;

            try {
                // Step 1: Create database
                const postgresClient = new pg.Client({ connectionString: `${baseUrl}/postgres` });
                try {
                    await postgresClient.connect();
                    const dbCheck = await postgresClient.query(
                        `SELECT 1 FROM pg_database WHERE datname = $1`,
                        [tenant.tenant_db_name]
                    );
                    if (dbCheck.rows.length === 0) {
                        await postgresClient.query(`CREATE DATABASE "${tenant.tenant_db_name}"`);
                        console.log(`   ✓ Created database: ${tenant.tenant_db_name}`);
                    } else {
                        console.log(`   ℹ️  Database already exists: ${tenant.tenant_db_name}`);
                    }
                } catch (error) {
                    console.log(`   ⚠️  Could not create database: ${error.message}`);
                    continue;
                } finally {
                    await postgresClient.end();
                }

                // Step 2: Run migrations
                console.log(`   📦 Running migrations...`);
                try {
                    execSync(
                        `cd "${tenantApiPath}" && TENANT_PG_URL="${tenantDbUrl}" TENANT_ID="${tenant.id}" pnpm exec sequelize-cli db:migrate --config sequelize.config.js --migrations-path database/migrations`,
                        { stdio: 'pipe', env: { ...process.env, TENANT_PG_URL: tenantDbUrl, TENANT_ID: tenant.id } }
                    );
                    console.log(`   ✓ Migrations completed`);
                } catch (error) {
                    console.log(`   ❌ Migration failed: ${error.message}`);
                    continue;
                }

                // Step 3: Run seeders (creates departments, roles, permissions)
                console.log(`   🌱 Running seeders...`);
                try {
                    execSync(
                        `cd "${tenantApiPath}" && TENANT_PG_URL="${tenantDbUrl}" TENANT_ID="${tenant.id}" pnpm exec sequelize-cli db:seed:all --config sequelize.config.js --seeders-path database/seeders`,
                        { stdio: 'pipe', env: { ...process.env, TENANT_PG_URL: tenantDbUrl, TENANT_ID: tenant.id } }
                    );
                    console.log(`   ✓ Seeders completed`);
                } catch (error) {
                    console.log(`   ❌ Seeder failed: ${error.message}`);
                    continue;
                }

                // Step 4: Create first admin user
                const client = new pg.Client({ connectionString: tenantDbUrl });
                try {
                    await client.connect();

                    // Get admin department and role
                    const adminDept = await client.query(
                        `SELECT id FROM departments WHERE name = 'Administration' LIMIT 1`
                    );
                    const adminRole = await client.query(
                        `SELECT id FROM roles WHERE name = 'admin' LIMIT 1`
                    );

                    if (adminDept.rows.length === 0 || adminRole.rows.length === 0) {
                        console.log(`   ⚠️  Warning: Core data not found. Admin user not created.`);
                        await client.end();
                        continue;
                    }

                    // Check if admin user already exists
                    const existingUser = await client.query(
                        `SELECT id FROM users WHERE email = $1`,
                        [adminEmail]
                    );

                    if (existingUser.rows.length === 0) {
                        const passwordHash = hashSync(adminPassword, 10);
                        const userId = uuid();
                        
                        await client.query(
                            `INSERT INTO users (id, email, password_hash, first_name, last_name, tenant_id, department_id, status, created_at, updated_at)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())`,
                            [userId, adminEmail, passwordHash, 'Admin', 'User', tenant.id, adminDept.rows[0].id]
                        );

                        await client.query(
                            `INSERT INTO user_role_map (id, user_id, role_id, created_at, updated_at)
                             VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())
                             ON CONFLICT DO NOTHING`,
                            [userId, adminRole.rows[0].id]
                        );

                        console.log(`   ✅ First admin user created`);
                    } else {
                        console.log(`   ℹ️  Admin user already exists`);
                    }

                    console.log(`\n   👤 First Admin Credentials:`);
                    console.log(`      Email: ${adminEmail}`);
                    console.log(`      Password: ${adminPassword}`);
                    console.log(`\n   To use this hospital, set in tenant-api/.env:`);
                    console.log(`   TENANT_ID=${tenant.id}`);
                    console.log(`   TENANT_PG_URL=${tenantDbUrl}`);

                    await client.end();
                } catch (error) {
                    console.log(`   ❌ Error creating admin user: ${error.message}`);
                    await client.end();
                }
            } catch (error) {
                console.log(`   ❌ Error setting up tenant: ${error.message}`);
            }
        }
        console.log('\n================================\n');
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('tenants', {
            tenant_db_name: ['hospital_abdullah', 'hospital_ramzan']
        }, {});
    }
};
