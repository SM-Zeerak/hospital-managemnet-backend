# Hospital Management Backend

Multi-tenant Fastify services for the Hospital CRM platform. The monorepo contains the Owner API (central administration + provisioning) and the Tenant API (per-hospital CRM runtime) implemented with Sequelize, Socket.IO, and Coolify deployment automation.

## Repository Structure

- `owner-api/` – Owner control plane (tenants, plans, subscriptions, features, templates, Coolify provisioning, audit, owner-socket).
- `tenant-api/` – Tenant runtime (auth, users, RBAC, CRM modules, analytics, search, sockets, admin-sync).
- `docs/` – Project guides and scope notes.
- `docker-compose.yml` – Example Coolify/compose reference for local orchestration.

Each API is organized with modular boundaries: `src/modules/*` contain scoped controllers/services/schemas/routes; `src/database` handles Sequelize initialization, models, migrations, and seeders; `src/common` stores shared utilities (e.g., pagination helpers).

## Getting Started

1. **Install dependencies**
   ```bash
   cd owner-api && pnpm install
   cd ../tenant-api && pnpm install
   ```

2. **Environment variables**
   Copy `.env.example` from both `owner-api/` and `tenant-api/` into `.env` files and adjust secrets (Postgres URLs, JWT secrets, Redis, Coolify credentials, Owner base URL, sync token, etc.).

3. **Owner database setup** (databases are created automatically if missing)
   ```bash
   cd owner-api
   pnpm exec sequelize-cli db:migrate --config sequelize.config.js --migrations-path database/migrations
   pnpm exec sequelize-cli db:seed:all --config sequelize.config.js --seeders-path database/seeders
   ```

4. **Register a tenant via Owner API**
   ```bash
   cd ../tenant-api
   pnpm run register-tenant -- \
     --company "City General Hospital" \
     --subdomain citygeneral \
     --db hospital_citygeneral \
     --region us-east-1
   ```
   The script logs into the Owner API (using `OWNER_API_BASE`, `OWNER_SUPERADMIN_EMAIL`, `OWNER_SUPERADMIN_PASSWORD`) and creates the tenant record, printing the new `tenant.id`. Copy that UUID into the tenant `.env` as `TENANT_ID`.

5. **Tenant database setup**
   ```bash
   pnpm exec sequelize-cli db:migrate --config sequelize.config.js --migrations-path database/migrations
   pnpm exec sequelize-cli db:seed:all --config sequelize.config.js --seeders-path database/seeders
   ```

6. **Run services**
   ```bash
   cd owner-api
   pnpm run dev

   cd ../tenant-api
   pnpm run dev
   ```

Owner API defaults to port `4001`, tenant API to `4002` (see `.env.example`).  
All HTTP routes are prefixed with `/api/v1` (e.g., `http://localhost:4001/api/v1/owner/auth/login`).

## Key Features (work in progress)

- **Owner API**
  - Owner users management (super-admin/admin)
  - Tenant lifecycle (plans, subscriptions, features, templates, provisioning via Coolify, VPS nodes, audit log)
  - Socket-enabled telemetry channel (optional) and Swagger-ready configuration
  - Export endpoints + global template version/diff for tenant sync, guarded by `TENANT_SYNC_WEBHOOK_TOKEN`
  - Tenant sync webhook trigger (`POST /owner/tenants/:id/notify-sync`) for manual cache refreshes
  - Database health monitoring (`GET /owner/tenants/:id/database-health`) to check both primary and secondary database connections per tenant

- **Tenant API**
  - Auth + RBAC guards (roles, permissions, departments)
  - Hospital modules: users, admin, roles, departments, permissions
  - Socket.IO namespace `/app`
  - Admin sync with feature + subscription + template cache persistence and diff endpoint
  - Dual database support (local PostgreSQL + online PostgreSQL) with health monitoring
  - Swagger documentation available at `/docs` endpoint
  - Seeded with hospital departments (Administration, Medical, Nursing, Pharmacy, Laboratory, Radiology, Emergency, Surgery, Finance, HR, IT, Maintenance)
  - Pre-configured roles (admin, sub-admin, doctor, nurse, pharmacist, lab-technician, radiologist, finance-manager, hr-manager, it-admin)
  - First admin user created: `admin@hospital.com` / `Admin@123` (change on first login)

## Next Steps

- Surface template/version diffing for tenant UI and emit change webhooks.
- Expand cURL/OpenAPI docs for remaining endpoints and automate publishing.
- Integrate Coolify deployment status polling as background job, add file storage provider integrations, analytics/AI enhancements, and expand automated tests.

## Database Configuration

The tenant API supports dual database connections:
- **Primary Database (Local)**: Required for hospital operations, configured via `TENANT_PG_URL`
- **Secondary Database (Online)**: Optional, configured via `TENANT_PG_URL_ONLINE` - used for sync, backup, and external access

If the online database is not connected, the server will show an error in logs but continue running. The primary (local) database connection is required for the server to start.

## Health Monitoring

The owner API provides database health checks for each tenant:
- Endpoint: `GET /api/v1/owner/tenants/:id/database-health`
- Returns status of both primary (local) and secondary (online) databases
- Primary (local) is required for operations
- Secondary (online) is optional and used for sync/backup/external access
- Useful for monitoring database connectivity in production environments
