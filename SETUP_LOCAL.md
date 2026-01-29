# Local Setup Guide - 2 Sample Hospitals

This guide shows you how to set up 2 sample hospitals locally for development/testing.

## 🚀 Quick Setup

### Step 1: Setup Owner API

```bash
cd owner-api

# Install dependencies
pnpm install

# Copy .env.example to .env
cp .env.example .env

# Edit .env and configure your database:
# OWNER_PG_URL=postgres://postgres:password@localhost:5432/hospital_management_owner

# Create database (automatically creates if doesn't exist)
pnpm run db:create
# OR manually: createdb hospital_management_owner

# Run migrations
pnpm run db:migrate

# Run seeders (creates super-admin and 2 sample hospitals)
# This will automatically:
# - Create tenant records
# - Create tenant databases
# - Run migrations for each tenant
# - Run seeders for each tenant (departments, roles, permissions)
# - Create first admin user for each tenant (admin@tenantname.com / Admin1234)
pnpm run db:seed

# OR run all at once:
pnpm run db:setup

# Get tenant IDs (after seeding):
pnpm run tenants:list
```

**After running seeders, you'll see output like:**
```
✅ Sample Hospitals Created:
================================

🏥 Abdullah Hospital
   Database: hospital_abdullah
   TENANT_ID: abc-123-def-456-...

   To use this hospital, set in tenant-api/.env:
   TENANT_ID=abc-123-def-456-...

🏥 Ramzan Hospital
   Database: hospital_ramzan
   TENANT_ID: xyz-789-ghi-012-...

   To use this hospital, set in tenant-api/.env:
   TENANT_ID=xyz-789-ghi-012-...
```

**Copy these TENANT_IDs!** You'll need them in Step 2.

### Step 2: Setup Tenant API

**✅ Databases, migrations, seeders, and first admin users are automatically created by the owner seeder!**

You just need to configure the tenant-api to use one of the hospitals:

```bash
cd tenant-api

# Install dependencies
pnpm install

# Copy .env.example to .env
cp .env.example .env

# Get tenant IDs from owner-api
cd ../owner-api
pnpm run tenants:list
```

This will show you:
- Tenant IDs for both hospitals
- Admin credentials for each hospital

Then edit `tenant-api/.env` and set:
```env
TENANT_ID=<tenant-id-from-output>
TENANT_PG_URL=postgres://postgres:password@localhost:5432/hospital_abdullah
# OR for Ramzan:
# TENANT_PG_URL=postgres://postgres:password@localhost:5432/hospital_ramzan
```

**That's it!** The database is already created, migrated, and seeded with the first admin user.

### Step 3: Start Services

#### Start Owner API:
```bash
cd owner-api
pnpm run dev
# Runs on http://localhost:4001
```

#### Start Tenant API:
```bash
cd tenant-api
pnpm run dev
# Runs on http://localhost:4002
```

## 🔄 Switching Between Hospitals

To switch between hospitals, just update `TENANT_ID` in `tenant-api/.env`:

```env
# For Abdullah Hospital
TENANT_ID=abc-123-def-456-...

# For Ramzan Hospital  
TENANT_ID=xyz-789-ghi-012-...
```

Then restart the tenant-api server.

## 📋 Default Admin Users

Each hospital has a default admin user created automatically:

**Abdullah Hospital:**
- Email: `admin@abdullahhospital.com`
- Password: `Admin1234`

**Ramzan Hospital:**
- Email: `admin@ramzanhospital.com`
- Password: `Admin1234`

**Pattern:** `admin@<tenantname>.com` / `Admin1234`

**⚠️ Change these passwords after first login!**

## 🗄️ Database Structure

```
Owner Database (hospital_management_owner):
├── tenants table
│   ├── Abdullah Hospital (id: abc-123...)
│   └── Ramzan Hospital (id: xyz-789...)
└── owner_users, plans, features, etc.

Tenant Databases:
├── hospital_abdullah
│   ├── users (with tenant_id = abc-123...)
│   ├── departments, roles, permissions
│   └── All hospital data
└── hospital_ramzan
    ├── users (with tenant_id = xyz-789...)
    ├── departments, roles, permissions
    └── All hospital data
```

## 🧪 Testing

### Test Owner API:
```bash
# Login as super-admin
curl -X POST http://localhost:4001/api/v1/owner/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@hospitalmanagement.com","password":"ChangeMe123!"}'

# List all hospitals
curl -X GET http://localhost:4001/api/v1/owner/tenants \
  -H "Authorization: Bearer <token>"

# View hospital users
curl -X GET http://localhost:4001/api/v1/owner/tenants/<tenant-id>/users \
  -H "Authorization: Bearer <token>"
```

### Test Tenant API (Abdullah Hospital):
```bash
# Login as admin
curl -X POST http://localhost:4002/api/v1/tenant/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"Admin@123"}'

# List users (only sees Abdullah Hospital users)
curl -X GET http://localhost:4002/api/v1/tenant/users \
  -H "Authorization: Bearer <token>"
```

### Switch to Ramzan Hospital:
1. Update `TENANT_ID` in `tenant-api/.env` to Ramzan's UUID
2. Restart tenant-api server
3. Login with same credentials (admin@hospital.com / Admin@123)
4. Now you'll see Ramzan Hospital's data

## 📝 Notes

- Each hospital has **completely isolated data**
- Switching `TENANT_ID` in `.env` changes which hospital you're accessing
- Both hospitals can run simultaneously (different databases)
- Owner API can see and manage both hospitals
- Tenant API only sees the hospital specified by `TENANT_ID`

## 🐛 Troubleshooting

**Database doesn't exist:**
```bash
createdb hospital_abdullah
createdb hospital_ramzan
```

**Seeder fails:**
- Make sure `TENANT_ID` is set in environment
- Check database connection string
- Ensure migrations ran successfully first

**Can't see data after switching:**
- Make sure you restarted the tenant-api server
- Verify `TENANT_ID` in `.env` matches the hospital you want
- Check database name matches in `TENANT_PG_URL`
