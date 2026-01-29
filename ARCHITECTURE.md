# Hospital Management System - Architecture Overview

## 🏥 Multi-Hospital Setup (Multi-Tenant Architecture)

### How It Works

**Scenario**: You have 3-4 hospitals (Abdullah Hospital, Ramzan Hospital, etc.)

#### 1. **Each Hospital = One Tenant**

Each hospital runs as a **separate tenant** with:
- ✅ **Local Database** (Primary) - Stores all hospital data locally
- ✅ **Local Backend Server** - Runs at the hospital location
- ✅ **Online Database** (Secondary) - Syncs/backs up to online server
- ✅ **Online Server** - Owner API can monitor all hospitals

#### 2. **Database Naming**

When you register a new hospital/tenant, you specify:
- **Company Name**: "Abdullah Hospital"
- **Subdomain**: "abdullah" (optional, for future use)
- **Database Name**: "hospital_abdullah" (you choose this)

**Example Registration:**
```bash
# Register Abdullah Hospital
pnpm run register-tenant -- \
  --company "Abdullah Hospital" \
  --subdomain abdullah \
  --db hospital_abdullah \
  --region local

# Register Ramzan Hospital  
pnpm run register-tenant -- \
  --company "Ramzan Hospital" \
  --subdomain ramzan \
  --db hospital_ramzan \
  --region local
```

**Result:**
- Abdullah Hospital → Database: `hospital_abdullah` (local) + `hospital_abdullah` (online)
- Ramzan Hospital → Database: `hospital_ramzan` (local) + `hospital_ramzan` (online)

#### 3. **API Routes - Same for All Hospitals**

**✅ All hospitals use the SAME API routes:**
- `POST /api/v1/tenant/auth/login`
- `GET /api/v1/tenant/users`
- `GET /api/v1/tenant/departments`
- etc.

**How Isolation Works:**
- Each hospital backend has `TENANT_ID` in `.env` file
- When a user logs in, their JWT token contains `tenantId`
- All queries automatically filter by `tenantId`
- **Each hospital can ONLY see their own data**

**Example:**
```
Abdullah Hospital:
  - TENANT_ID: "uuid-123-abc"
  - Users can only see Abdullah Hospital users/departments
  
Ramzan Hospital:
  - TENANT_ID: "uuid-456-def"  
  - Users can only see Ramzan Hospital users/departments
```

#### 4. **Owner API - Central Monitoring**

The **Owner API** can see ALL hospitals:
- `GET /api/v1/owner/tenants` - List all hospitals
- `GET /api/v1/owner/tenants/:id` - View specific hospital
- `GET /api/v1/owner/tenants/:id/database-health` - Check DB health for any hospital

**Owner sees:**
- All tenant records (hospitals)
- Database health status for each
- Can trigger syncs
- Can manage subscriptions/plans

---

## 🖥️ Deployment Architecture

### At Each Hospital Location:

```
Hospital Computer/Server
├── Local PostgreSQL Database
│   └── hospital_abdullah (primary DB)
├── Tenant API Backend
│   ├── Port: 4002
│   ├── TENANT_ID: "uuid-123-abc"
│   └── Connects to:
│       ├── Local DB (required) ✅
│       └── Online DB (optional, for sync) ⚠️
└── Windows Service/PM2 (for auto-start)
```

### Online Server (Your Control):

```
Online Server
├── Owner API
│   └── Port: 4001
│   └── Can see all hospitals
├── Online PostgreSQL
│   ├── hospital_abdullah (backup/sync)
│   ├── hospital_ramzan (backup/sync)
│   └── hospital_xyz (backup/sync)
└── Owner Database
    └── Stores tenant records
```

---

## 🔄 Data Flow

### Normal Operation:
1. Hospital staff uses local backend → Local database
2. Data stays local (fast, offline-capable)
3. Periodically syncs to online database (backup)

### Owner Monitoring:
1. Owner API queries online database
2. Can see synced data from all hospitals
3. Can check health of each hospital's databases

---

## 🚀 Auto-Startup & Auto-Recovery

### Current Status: **NOT IMPLEMENTED** (as requested)

### When You're Ready, Options:

#### **Option 1: Windows Service** (Recommended for Windows)
- Install backend as Windows Service
- Auto-starts with Windows
- Auto-restarts on crash
- Tools: `node-windows`, `nssm`

#### **Option 2: PM2** (Cross-platform)
- Process manager for Node.js
- Auto-restart on crash
- Can add to Windows startup
- Command: `pm2 startup`

#### **Option 3: Task Scheduler** (Windows)
- Schedule task to run on startup
- Basic auto-start, no auto-recovery

**Note**: You said you don't want this feature right now, so it's not implemented. The backend currently needs to be started manually.

---

## 📋 Setup Process for New Hospital

### Step 1: Owner Creates Tenant via Owner API

**Owner logs into Owner API and creates tenant with first admin:**

```bash
POST /api/v1/owner/tenants
Authorization: Bearer <owner-token>

{
  "companyName": "Abdullah Hospital",
  "subdomain": "abdullah",
  "tenantDbName": "hospital_abdullah",
  "firstAdmin": {
    "email": "admin@abdullahhospital.com",
    "password": "SecurePass123!",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

**This automatically:**
- ✅ Creates tenant record in Owner database
- ✅ Creates first admin user in tenant database (with admin role)
- ✅ Returns `TENANT_ID` (UUID) and tenant details

**Owner can also:**
- View all tenant users: `GET /api/v1/owner/tenants/:id/users`
- Create additional users: `POST /api/v1/owner/tenants/:id/users`

### Step 2: Hospital Setup Local Environment

**Hospital receives `TENANT_ID` from Owner, then:**

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and set:
TENANT_ID=<uuid-from-owner>
TENANT_PG_URL=postgres://user:pass@localhost:5432/hospital_abdullah
TENANT_PG_URL_ONLINE=postgres://user:pass@online-server:5432/hospital_abdullah
```

### Step 3: Create Local Database & Run Migrations

```bash
# Database is created automatically, or manually:
createdb hospital_abdullah

# Run migrations
pnpm exec sequelize-cli db:migrate

# Run seeders (creates departments, roles, permissions)
pnpm exec sequelize-cli db:seed:all
```

**Note:** First admin user is already created by Owner API, so seeders will skip if exists.

### Step 4: Start Backend

```bash
pnpm run dev  # Development
# or
pnpm start    # Production
```

### Step 5: First Admin Login

**First admin can now login:**
- Email: `admin@abdullahhospital.com` (from Step 1)
- Password: `SecurePass123!` (from Step 1)
- Has full admin permissions

---

## 🔐 Security & Isolation

### Tenant Isolation:
- ✅ Each hospital has unique `TENANT_ID`
- ✅ All database queries filter by `tenantId`
- ✅ JWT tokens include `tenantId`
- ✅ Users can ONLY access their hospital's data

### API Routes:
- ✅ Same routes for all hospitals
- ✅ Isolation handled automatically by `TENANT_ID`
- ✅ No cross-tenant data leakage

---

## 📊 Summary

| Aspect | Details |
|-------|---------|
| **API Routes** | Same for all hospitals |
| **Isolation** | Via `TENANT_ID` in each hospital's `.env` |
| **Database Names** | You choose when registering (e.g., `hospital_abdullah`) |
| **Local DB** | Primary - Required for operations |
| **Online DB** | Secondary - Optional, for sync/backup |
| **Owner Visibility** | Can see all hospitals via Owner API |
| **Auto-Startup** | Not implemented (as requested) |
| **Workflow** | Each hospital has separate, isolated workflow |

---

## ❓ Common Questions

**Q: Can Abdullah Hospital see Ramzan Hospital's data?**
A: ❌ No. Each hospital is completely isolated by `TENANT_ID`.

**Q: Do I need separate API servers for each hospital?**
A: ✅ Yes. Each hospital runs its own backend server locally.

**Q: Can the owner see all hospitals?**
A: ✅ Yes. Owner API can list and monitor all hospitals.

**Q: What if a hospital's local DB fails?**
A: They can restore from online backup (if sync was working).

**Q: Can hospitals share data?**
A: ❌ Not by default. Would need custom integration via Owner API.
