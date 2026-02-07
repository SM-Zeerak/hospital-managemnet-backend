#!/usr/bin/env node
import 'dotenv/config';
import { execSync } from 'child_process';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
    options: {
        tenantId: { type: 'string' },
        dbName: { type: 'string' },
        help: { type: 'boolean', short: 'h' }
    },
    allowPositionals: false
});

if (values.help) {
    console.log(`
Usage: node scripts/seed-hospital.mjs [options]

Options:
  --tenantId <uuid>    Tenant ID (required)
  --dbName <name>      Database name (required)
  -h, --help          Show this help message

Example:
  node scripts/seed-hospital.mjs --tenantId abc-123 --dbName hospital_abdullah
`);
    process.exit(0);
}

if (!values.tenantId || !values.dbName) {
    console.error('❌ Error: --tenantId and --dbName are required');
    console.log('Run with --help for usage information');
    process.exit(1);
}

console.log(`\n🏥 Seeding Hospital Database`);
console.log(`================================`);
console.log(`Tenant ID: ${values.tenantId}`);
console.log(`Database: ${values.dbName}`);
console.log(`================================\n`);

try {
    // Set TENANT_ID in environment
    process.env.TENANT_ID = values.tenantId;
    process.env.TENANT_PG_URL = process.env.TENANT_PG_URL?.replace(/\/[^\/]+$/, `/${values.dbName}`) || 
        `postgres://postgres:password@localhost:5432/${values.dbName}`;

    console.log('📦 Running migrations...');
    execSync('pnpm exec sequelize-cli db:migrate --config sequelize.config.js --migrations-path database/migrations', {
        stdio: 'inherit',
        env: { ...process.env, TENANT_ID: values.tenantId }
    });

    console.log('\n🌱 Running seeders...');
    execSync('pnpm exec sequelize-cli db:seed:all --config sequelize.config.js --seeders-path database/seeders', {
        stdio: 'inherit',
        env: { ...process.env, TENANT_ID: values.tenantId }
    });

    console.log('\n✅ Hospital database seeded successfully!');
    console.log(`\n📝 To use this hospital, set in .env:`);
    console.log(`   TENANT_ID=${values.tenantId}`);
    console.log(`   TENANT_PG_URL=postgres://user:pass@localhost:5432/${values.dbName}\n`);
} catch (error) {
    console.error('\n❌ Error seeding hospital database:', error.message);
    process.exit(1);
}
