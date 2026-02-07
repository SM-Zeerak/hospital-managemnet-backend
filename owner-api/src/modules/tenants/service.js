import { Op, Sequelize } from 'sequelize';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Helper to get API path based on tenant type
function getTenantApiPath(type) {
    const apiMap = {
        'HOSPITAL': '../tenant-api',
        'SCHOOL': '../school-api',
        'GUARD': '../guards-api'
    };
    const relativePath = apiMap[type] || '../tenant-api';
    return resolve(process.cwd(), relativePath);
}

function assertTenantApiInstalled(apiPath) {
    const dotenvPkg = join(apiPath, 'node_modules', 'dotenv', 'package.json');
    if (!fs.existsSync(dotenvPkg)) {
        throw new Error(
            `Dependencies not installed in ${apiPath}. ` +
            `Run: cd "${apiPath}" && pnpm install`
        );
    }
}

export async function listTenants(models, options = {}) {
    const { Tenant, Plan } = models;
    const {
        page = 1,
        limit = 20,
        status,
        search
    } = options;

    const where = {};

    if (status) {
        where.status = status;
    }

    if (search) {
        where[Op.or] = [
            { companyName: { [Op.iLike]: `%${search}%` } },
            { subdomain: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Tenant.findAndCountAll({
        where,
        include: [{ model: Plan, as: 'plan' }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
    });

    return {
        data: rows,
        meta: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
}

export async function createTenant(models, payload) {
    const { Tenant } = models;
    const { firstAdmin, ...tenantData } = payload;

    // Create tenant record
    const tenant = await Tenant.create({
        ...tenantData,
        status: tenantData.status || 'active'
    });

    // Automatically create database, run migrations, seeders, and create first admin
    await setupTenantDatabase(tenant, firstAdmin);

    return tenant;
}

async function setupTenantDatabase(tenant, adminData) {
    const apiPath = getTenantApiPath(tenant.type);
    assertTenantApiInstalled(apiPath);

    // Construct tenant database URL (using local DB as both primary and secondary for now)
    const dbUrlTemplate = process.env.TENANT_PG_URL_TEMPLATE ||
        process.env.TENANT_PG_URL?.replace(/\/[^\/]+$/, '/{dbname}') || null;

    if (!dbUrlTemplate) {
        throw new Error('TENANT_PG_URL_TEMPLATE or TENANT_PG_URL not configured');
    }

    const dbUrl = dbUrlTemplate.replace('{dbname}', tenant.tenantDbName);

    // Extract connection info for database creation
    const connection = new URL(dbUrl);
    const databaseName = connection.pathname.replace(/^\//, '');
    connection.pathname = '/postgres';

    // Step 1: Create database if it doesn't exist
    const postgresClient = new pg.Client({ connectionString: connection.toString() });
    try {
        await postgresClient.connect();
        const dbCheck = await postgresClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [databaseName]
        );
        if (dbCheck.rows.length === 0) {
            await postgresClient.query(`CREATE DATABASE "${databaseName}"`);
            console.log(`✓ Created database: ${databaseName}`);
        }
    } catch (error) {
        throw new Error(`Failed to create database: ${error.message}`);
    } finally {
        await postgresClient.end();
    }

    // Step 2: Run migrations
    try {
        execSync(
            `cd "${apiPath}" && TENANT_PG_URL="${dbUrl}" TENANT_ID="${tenant.id}" pnpm exec sequelize-cli db:migrate --config sequelize.config.js --migrations-path database/migrations`,
            { stdio: 'pipe', env: { ...process.env, TENANT_PG_URL: dbUrl, TENANT_ID: tenant.id }, cwd: apiPath }
        );
        console.log(`✓ Migrations completed for ${tenant.tenantDbName}`);
    } catch (error) {
        throw new Error(`Failed to run migrations: ${error.message}`);
    }

    // Step 3: Run seeders (creates departments, roles, permissions)
    try {
        execSync(
            `cd "${apiPath}" && TENANT_PG_URL="${dbUrl}" TENANT_ID="${tenant.id}" pnpm exec sequelize-cli db:seed:all --config sequelize.config.js --seeders-path database/seeders`,
            { stdio: 'pipe', env: { ...process.env, TENANT_PG_URL: dbUrl, TENANT_ID: tenant.id }, cwd: apiPath }
        );
        console.log(`✓ Seeders completed for ${tenant.tenantDbName}`);
    } catch (error) {
        throw new Error(`Failed to run seeders: ${error.message}`);
    }

    // Step 4: Create first admin user
    // Generate email from tenant name: admin@tenantname.com
    const tenantName = tenant.companyName.toLowerCase().replace(/\s+/g, '');
    const defaultAdmin = adminData || {
        email: `admin@${tenantName}.com`,
        password: 'Admin1234',
        firstName: 'Admin',
        lastName: 'User'
    };

    await createFirstAdminUser(tenant, defaultAdmin, dbUrl);
    console.log(`✓ First admin created: ${defaultAdmin.email} / ${defaultAdmin.password}`);
}

async function createFirstAdminUser(tenant, adminData, dbUrl) {
    if (!dbUrl) {
        dbUrl = process.env.TENANT_PG_URL_TEMPLATE
            ? process.env.TENANT_PG_URL_TEMPLATE.replace('{dbname}', tenant.tenantDbName)
            : process.env.TENANT_PG_URL?.replace(/\/[^\/]+$/, `/${tenant.tenantDbName}`) || null;
    }

    if (!dbUrl) {
        throw new Error('Tenant database URL not configured');
    }

    // Connect to tenant database
    const tenantSequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false
    });

    try {
        await tenantSequelize.authenticate();

        // Find admin role
        const [adminRole] = await tenantSequelize.query(
            `SELECT id FROM roles WHERE name = 'admin' LIMIT 1`,
            { type: tenantSequelize.QueryTypes.SELECT }
        );

        if (!adminRole) {
            throw new Error('Admin role not found in tenant database. Please run seeders first.');
        }

        // Find administration department
        const [adminDept] = await tenantSequelize.query(
            `SELECT id FROM departments WHERE name = 'Administration' LIMIT 1`,
            { type: tenantSequelize.QueryTypes.SELECT }
        );

        // Hash password
        const passwordHash = await bcrypt.hash(adminData.password, 10);

        // Check if admin user already exists
        const existingUser = await tenantSequelize.query(
            `SELECT id FROM users WHERE email = ?`,
            {
                replacements: [adminData.email],
                type: tenantSequelize.QueryTypes.SELECT
            }
        );

        let adminUser;
        if (existingUser.length === 0) {
            // Create admin user
            const adminUserResult = await tenantSequelize.query(
                `INSERT INTO users (id, email, password_hash, first_name, last_name, tenant_id, department_id, status, created_at, updated_at)
                 VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
                 RETURNING id, email, first_name, last_name, status`,
                {
                    replacements: [
                        adminData.email,
                        passwordHash,
                        adminData.firstName,
                        adminData.lastName,
                        tenant.id,
                        adminDept?.id || null
                    ],
                    type: tenantSequelize.QueryTypes.SELECT
                }
            );

            adminUser = adminUserResult[0];

            // Assign admin role
            await tenantSequelize.query(
                `INSERT INTO user_role_map (id, user_id, role_id, created_at, updated_at) 
                 VALUES (gen_random_uuid(), ?, ?, NOW(), NOW()) 
                 ON CONFLICT DO NOTHING`,
                {
                    replacements: [adminUser.id, adminRole.id],
                    type: tenantSequelize.QueryTypes.INSERT
                }
            );
        } else {
            adminUser = existingUser[0];
        }

        await tenantSequelize.close();
        return adminUser;
    } catch (error) {
        await tenantSequelize.close();
        throw error;
    }
}

export function findTenantById(models, id) {
    const { Tenant, Plan } = models;
    return Tenant.findByPk(id, {
        include: [{ model: Plan, as: 'plan' }]
    });
}

export async function updateTenant(models, id, changes) {
    const tenant = await models.Tenant.findByPk(id);
    if (!tenant) {
        return null;
    }

    await tenant.update(changes);
    return tenant.reload({ include: [{ model: models.Plan, as: 'plan' }] });
}

export async function notifyTenantSync(app, tenantId, options = {}) {
    const logger = app.log.child({ module: 'tenant-sync', tenantId });
    const tenant = await app.db.models.Tenant.findByPk(tenantId);
    if (!tenant) {
        return { ok: false, status: 404, message: 'Tenant not found' };
    }

    const syncUrl = options.overrideUrl || tenant.syncWebhookUrl;
    if (!syncUrl) {
        return { ok: false, status: 400, message: 'Tenant sync webhook URL not configured' };
    }

    const token = process.env.TENANT_SYNC_WEBHOOK_TOKEN;
    if (!token) {
        return { ok: false, status: 503, message: 'TENANT_SYNC_WEBHOOK_TOKEN not configured' };
    }

    const payload = {
        reason: options.reason || 'manual_trigger',
        triggeredBy: options.triggeredBy || null,
        triggeredAt: new Date().toISOString()
    };

    try {
        const response = await fetch(syncUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const bodyText = await response.text();
        if (!response.ok) {
            logger.warn({ status: response.status, body: bodyText }, 'Tenant sync webhook failed');
            return {
                ok: false,
                status: response.status,
                message: 'Tenant sync webhook failed',
                response: bodyText
            };
        }

        logger.info('Tenant sync webhook dispatched');
        return {
            ok: true,
            status: response.status,
            response: bodyText
        };
    } catch (error) {
        logger.error({ err: error }, 'Tenant sync webhook error');
        return {
            ok: false,
            status: 503,
            message: error.message
        };
    }
}

export async function checkTenantDatabaseHealth(app, tenantId) {
    const { Sequelize } = await import('sequelize');
    const tenant = await app.db.models.Tenant.findByPk(tenantId);
    if (!tenant) {
        return { ok: false, status: 404, message: 'Tenant not found' };
    }

    const health = {
        tenantId: tenant.id,
        tenantName: tenant.companyName,
        timestamp: new Date().toISOString(),
        primary: { connected: false, error: null, type: 'local' },
        secondary: { connected: false, error: null, configured: false, type: 'online' }
    };

    // Construct primary database URL (local) - required for hospital operations
    // Assuming format: postgres://user:pass@host:port/dbname
    const primaryDbUrl = process.env.TENANT_PG_URL_TEMPLATE
        ? process.env.TENANT_PG_URL_TEMPLATE.replace('{dbname}', tenant.tenantDbName)
        : process.env.TENANT_PG_URL?.replace(/\/[^\/]+$/, `/${tenant.tenantDbName}`) || null;

    if (!primaryDbUrl) {
        health.primary.error = 'Primary database (local) URL not configured';
        return { ok: false, health };
    }

    // Check primary database (local)
    try {
        const primarySequelize = new Sequelize(primaryDbUrl, {
            dialect: 'postgres',
            logging: false,
            pool: { max: 1, min: 0, idle: 10000 }
        });
        await primarySequelize.authenticate();
        await primarySequelize.close();
        health.primary.connected = true;
    } catch (error) {
        health.primary.error = error.message;
        health.primary.connected = false;
    }

    // Construct secondary database URL (online) - optional for sync/backup
    const secondaryDbUrl = process.env.TENANT_PG_URL_ONLINE_TEMPLATE
        ? process.env.TENANT_PG_URL_ONLINE_TEMPLATE.replace('{dbname}', tenant.tenantDbName)
        : process.env.TENANT_PG_URL_ONLINE?.replace(/\/[^\/]+$/, `/${tenant.tenantDbName}`) || null;

    if (secondaryDbUrl) {
        health.secondary.configured = true;
        try {
            const secondarySequelize = new Sequelize(secondaryDbUrl, {
                dialect: 'postgres',
                logging: false,
                pool: { max: 1, min: 0, idle: 10000 }
            });
            await secondarySequelize.authenticate();
            await secondarySequelize.close();
            health.secondary.connected = true;
        } catch (error) {
            health.secondary.error = error.message;
            health.secondary.connected = false;
        }
    }

    // Primary (local) must be connected. Secondary (online) is optional for sync/backup
    const allHealthy = health.primary.connected;

    return {
        ok: allHealthy,
        health
    };
}

export async function listTenantUsers(app, tenantId, options = {}) {
    const tenant = await app.db.models.Tenant.findByPk(tenantId);
    if (!tenant) {
        return { ok: false, status: 404, message: 'Tenant not found' };
    }

    const dbUrl = process.env.TENANT_PG_URL_TEMPLATE
        ? process.env.TENANT_PG_URL_TEMPLATE.replace('{dbname}', tenant.tenantDbName)
        : process.env.TENANT_PG_URL?.replace(/\/[^\/]+$/, `/${tenant.tenantDbName}`) || null;

    if (!dbUrl) {
        return { ok: false, status: 500, message: 'Tenant database URL template not configured' };
    }

    const tenantSequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false
    });

    try {
        await tenantSequelize.authenticate();

        const { page = 1, limit = 20, search, status } = options;
        const offset = (page - 1) * limit;

        let whereClause = `WHERE tenant_id = :tenantId`;
        const replacements = { tenantId };

        if (search) {
            whereClause += ` AND (first_name ILIKE :search OR last_name ILIKE :search OR email ILIKE :search)`;
            replacements.search = `%${search}%`;
        }

        if (status) {
            whereClause += ` AND status = :status`;
            replacements.status = status;
        }

        const users = await tenantSequelize.query(
            `SELECT id, email, first_name, last_name, status, created_at, updated_at 
             FROM users 
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT :limit OFFSET :offset`,
            {
                replacements: { ...replacements, limit, offset },
                type: tenantSequelize.QueryTypes.SELECT
            }
        );

        const countResult = await tenantSequelize.query(
            `SELECT COUNT(*) as count FROM users ${whereClause}`,
            {
                replacements,
                type: tenantSequelize.QueryTypes.SELECT
            }
        );

        await tenantSequelize.close();

        const total = parseInt(countResult[0]?.count || 0);

        return {
            ok: true,
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        await tenantSequelize.close();
        return { ok: false, status: 500, message: error.message };
    }
}

export async function createTenantUser(app, tenantId, userData) {
    const tenant = await app.db.models.Tenant.findByPk(tenantId);
    if (!tenant) {
        return { ok: false, status: 404, message: 'Tenant not found' };
    }

    const dbUrl = process.env.TENANT_PG_URL_TEMPLATE
        ? process.env.TENANT_PG_URL_TEMPLATE.replace('{dbname}', tenant.tenantDbName)
        : process.env.TENANT_PG_URL?.replace(/\/[^\/]+$/, `/${tenant.tenantDbName}`) || null;

    if (!dbUrl) {
        return { ok: false, status: 500, message: 'Tenant database URL template not configured' };
    }

    const tenantSequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false
    });

    try {
        await tenantSequelize.authenticate();

        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Create user
        const userResult = await tenantSequelize.query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, tenant_id, department_id, status, created_at, updated_at)
             VALUES (gen_random_uuid(), :email, :passwordHash, :firstName, :lastName, :tenantId, :departmentId, 'active', NOW(), NOW())
             RETURNING id, email, first_name, last_name, status, created_at`,
            {
                replacements: {
                    email: userData.email,
                    passwordHash,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    tenantId: tenant.id,
                    departmentId: userData.departmentId || null
                },
                type: tenantSequelize.QueryTypes.SELECT
            }
        );

        const user = userResult[0];

        // Assign roles if provided
        if (userData.roleIds && userData.roleIds.length > 0) {
            const userId = user.id;
            for (const roleId of userData.roleIds) {
                await tenantSequelize.query(
                    `INSERT INTO user_role_map (id, user_id, role_id, created_at, updated_at)
                     VALUES (gen_random_uuid(), :userId, :roleId, NOW(), NOW())
                     ON CONFLICT DO NOTHING`,
                    {
                        replacements: { userId, roleId },
                        type: tenantSequelize.QueryTypes.INSERT
                    }
                );
            }
        }

        await tenantSequelize.close();

        return {
            ok: true,
            data: user
        };
    } catch (error) {
        await tenantSequelize.close();
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
            return { ok: false, status: 409, message: 'User with this email already exists' };
        }
        return { ok: false, status: 500, message: error.message };
    }
}
