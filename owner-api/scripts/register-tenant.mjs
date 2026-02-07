#!/usr/bin/env node
import 'dotenv/config';
import minimist from 'minimist';
import { initDatabase } from '../src/database/index.js';
import { initModels } from '../src/database/models/index.js';
import { createTenant } from '../src/modules/tenants/service.js';

async function main() {
    const args = minimist(process.argv.slice(2));

    if (args.help || args.h) {
        console.log(`
Usage: pnpm run register-tenant -- [options]

Options:
  --company       Company Name (Required)
  --subdomain     Subdomain (Required)
  --db            Database Name (Required)
  --type          Tenant Type (optional: HOSPITAL, SCHOOL, GUARD. Default: HOSPITAL)
  --region        Region (default: local)
  --admin-email   Admin Email (optional, auto-generated if missing)
  --admin-pass    Admin Password (optional, default: Admin1234)
  --first-name    Admin First Name (default: Admin)
  --last-name     Admin Last Name (default: User)

Example:
  pnpm run register-tenant -- --company "Abdullah Hospital" --subdomain abdullah --db hospital_abdullah
        `);
        process.exit(0);
    }

    // Validate required arguments
    if (!args.company || !args.subdomain || !args.db) {
        console.error('❌ Error: Missing required arguments: --company, --subdomain, --db');
        process.exit(1);
    }

    console.log('🔄 Initializing Owner Database connection...');
    let sequelize;
    try {
        sequelize = await initDatabase();
        const models = initModels(sequelize);
        console.log('✅ Connected to Owner Database');

        const payload = {
            companyName: args.company,
            subdomain: args.subdomain,
            tenantDbName: args.db,
            type: (args.type || 'HOSPITAL').toUpperCase(),
            region: args.region || 'local',
            status: 'active',
            firstAdmin: {
                email: args['admin-email'], // service.js handles defaults if undefined
                password: args['admin-pass'],
                firstName: args['first-name'] || 'Admin',
                lastName: args['last-name'] || 'User'
            }
        };

        console.log(`\n🚀 Creating tenant: ${payload.companyName} (${payload.subdomain})...`);

        const tenant = await createTenant(models, payload);

        console.log('\n✅ Tenant Registered Successfully!');
        console.log('---------------------------------------------------');
        console.log(`UUID:           ${tenant.id}`);
        console.log(`Company:        ${tenant.companyName}`);
        console.log(`Type:           ${tenant.type}`);
        console.log(`Subdomain:      ${tenant.subdomain}`);
        console.log(`Database:       ${tenant.tenantDbName}`);
        console.log(`Region:         ${tenant.region}`);
        console.log(`Admin Email:    ${payload.firstAdmin.email || `admin@${tenant.companyName.toLowerCase().replace(/\s+/g, '')}.com`}`);
        console.log('---------------------------------------------------');

        // Setup is already done by createTenant -> setupTenantDatabase
        console.log('\n🎉 Setup complete. You can now start the tenant-api / school-api / guards-api.');

    } catch (error) {
        console.error('\n❌ Failed to register tenant:', error.message);
        if (error.original) {
            console.error('   Details:', error.original.message);
        }
        process.exit(1);
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
}

main();
