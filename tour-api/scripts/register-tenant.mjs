#!/usr/bin/env node
import 'dotenv/config';
import fetch from 'node-fetch';
import { parseArgs } from 'node:util';

function exitWith(message, code = 1) {
    // eslint-disable-next-line no-console
    console.error(message);
    process.exit(code);
}

function normalizeUrl(base) {
    if (!base) return base;
    return base.endsWith('/') ? base.slice(0, -1) : base;
}

async function login(ownerBase, email, password) {
    const response = await fetch(`${ownerBase}/owner/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const text = await response.text();
        exitWith(`Owner API login failed (${response.status}): ${text}`);
    }

    const body = await response.json();
    const token = body?.data?.accessToken;
    if (!token) {
        exitWith('Owner API login response missing accessToken');
    }

    return token;
}

async function createTenant(ownerBase, token, payload) {
    const response = await fetch(`${ownerBase}/owner/tenants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        exitWith(`Owner API tenant creation failed (${response.status}): ${text}`);
    }

    const body = await response.json();
    if (!body?.data?.id) {
        exitWith('Owner API tenant creation response missing tenant id');
    }

    return body.data;
}

async function main() {
    const { values } = parseArgs({
        options: {
            ownerBase: { type: 'string' },
            ownerEmail: { type: 'string' },
            ownerPassword: { type: 'string' },
            company: { type: 'string' },
            subdomain: { type: 'string' },
            db: { type: 'string' },
            region: { type: 'string' },
            webhook: { type: 'string' },
            planId: { type: 'string' }
        },
        allowPositionals: false
    });

    const ownerBase = normalizeUrl(values.ownerBase || process.env.OWNER_API_BASE);
    const ownerEmail = values.ownerEmail || process.env.OWNER_SUPERADMIN_EMAIL;
    const ownerPassword = values.ownerPassword || process.env.OWNER_SUPERADMIN_PASSWORD;

    if (!ownerBase) exitWith('OWNER_API_BASE (or --ownerBase) is required');
    if (!ownerEmail) exitWith('OWNER_SUPERADMIN_EMAIL (or --ownerEmail) is required');
    if (!ownerPassword) exitWith('OWNER_SUPERADMIN_PASSWORD (or --ownerPassword) is required');

    const tenantPayload = {
        companyName: values.company || process.env.TENANT_COMPANY_NAME,
        subdomain: values.subdomain || process.env.TENANT_SUBDOMAIN,
        tenantDbName: values.db || process.env.TENANT_DB_NAME,
        tenantRegion: values.region || process.env.TENANT_REGION,
        planId: values.planId || process.env.TENANT_PLAN_ID || null,
        syncWebhookUrl: values.webhook || process.env.TENANT_SYNC_WEBHOOK_URL || null
    };

    if (!tenantPayload.companyName) exitWith('Tenant company name missing (--company or TENANT_COMPANY_NAME)');
    if (!tenantPayload.subdomain) exitWith('Tenant subdomain missing (--subdomain or TENANT_SUBDOMAIN)');
    if (!tenantPayload.tenantDbName) exitWith('Tenant DB name missing (--db or TENANT_DB_NAME)');

    const token = await login(ownerBase, ownerEmail, ownerPassword);
    const tenant = await createTenant(ownerBase, token, tenantPayload);

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
        ok: true,
        tenant
    }, null, 2));
    // eslint-disable-next-line no-console
    console.log('\nSet TENANT_ID in your tenant .env to:\n', tenant.id);
}

main().catch((error) => {
    exitWith(error.message ?? error);
});


