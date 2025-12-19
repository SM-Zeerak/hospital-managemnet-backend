# Quick Start Guide

## 🚀 Running the Project

### 1. Update Database Credentials

Edit `.env` file and update the `PG_URL` with your PostgreSQL credentials:

```env
PG_URL=postgresql://username:password@localhost:5432/guard_backend
```

**Example:**
```env
PG_URL=postgresql://postgres:your_password@localhost:5432/guard_backend
```

### 2. Run Database Migrations

```bash
pnpm db:migrate
```

This will create the `super_admins` table.

### 3. Seed Initial Data

```bash
pnpm db:seed
```

This will create the first super admin:
- **Email:** `admin@guard.com`
- **Password:** `Admin@123`

### 4. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:4000`

## 📍 API Endpoints

### Base URLs
- **Main API:** `http://localhost:4000`
- **Superadmin API:** `http://localhost:4000/api/v1/superadmin`
- **Guard API:** `http://localhost:4000/api/v1/guard`
- **API Docs:** `http://localhost:4000/docs`

### Authentication Endpoints

**Login:**
```bash
POST http://localhost:4000/api/v1/superadmin/auth/login
Content-Type: application/json

{
  "email": "admin@guard.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "superAdmin": {
      "id": "...",
      "email": "admin@guard.com",
      "name": "Super Admin",
      "role": "super-admin"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer"
  }
}
```

**Get Profile (requires auth):**
```bash
GET http://localhost:4000/api/v1/superadmin/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Super Admin CRUD Endpoints

**Create Super Admin (requires super-admin role):**
```bash
POST http://localhost:4000/api/v1/superadmin/super-admins
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "email": "newadmin@guard.com",
  "password": "SecurePass123!",
  "name": "New Admin",
  "role": "super-admin"
}
```

**List Super Admins:**
```bash
GET http://localhost:4000/api/v1/superadmin/super-admins?page=1&limit=20
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Get Super Admin by ID:**
```bash
GET http://localhost:4000/api/v1/superadmin/super-admins/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Update Super Admin:**
```bash
PUT http://localhost:4000/api/v1/superadmin/super-admins/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

**Delete Super Admin:**
```bash
DELETE http://localhost:4000/api/v1/superadmin/super-admins/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🔧 Troubleshooting

### Database Connection Error

If you see `password authentication failed`:
1. Check PostgreSQL is running
2. Verify credentials in `.env` file
3. Ensure database `guard_backend` exists or update `PG_URL`

### Port Already in Use

If port 4000 is already in use:
1. Change `PORT` in `.env` file
2. Or stop the process using port 4000

### Migration Errors

If migrations fail:
1. Check database connection
2. Ensure Sequelize CLI is installed: `pnpm install`
3. Try running migrations manually

## 📝 Environment Variables

Required variables in `.env`:
- `PG_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - JWT access token secret (min 32 chars)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (min 32 chars)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)

## ✅ Verification

Check if server is running:
```bash
curl http://localhost:4000/health
```

Or visit in browser:
- `http://localhost:4000/` - API info
- `http://localhost:4000/docs` - Swagger documentation

