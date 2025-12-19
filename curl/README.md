# cURL Scripts for Hospital Backend API

This directory contains cURL scripts organized by API module for easy testing of all endpoints.

## Structure

```
curl/
├── config.sh                    # Configuration file with environment variables
├── super-admin/                 # Super Admin API endpoints
│   ├── auth/
│   │   ├── login.sh            # POST /auth/login
│   │   ├── refresh-token.sh    # POST /auth/refresh
│   │   ├── logout.sh           # POST /auth/logout
│   │   └── me.sh               # GET /auth/me
│   └── super-admins/
│       ├── create.sh           # POST /super-admins
│       ├── list.sh             # GET /super-admins
│       ├── get.sh              # GET /super-admins/:id
│       ├── update.sh            # PUT /super-admins/:id
│       └── delete.sh           # DELETE /super-admins/:id
└── hospital/                    # Hospital API endpoints (coming soon)
```

## Quick Start

### 1. Configure Environment Variables

```bash
# Source the config file
source curl/config.sh

# Or set variables manually
export BASE_URL="http://localhost:4000"
export ACCESS_TOKEN="your-access-token-here"
export REFRESH_TOKEN="your-refresh-token-here"
export SUPER_ADMIN_ID="uuid-of-super-admin"
```

### 2. Make Scripts Executable (Linux/Mac)

```bash
chmod +x curl/**/*.sh
```

### 3. Run Scripts

#### Authentication Flow

```bash
# 1. Login to get tokens
./curl/super-admin/auth/login.sh

# Copy the accessToken and refreshToken from response, then:
export ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Get your profile
./curl/super-admin/auth/me.sh

# 3. Refresh token (if needed)
./curl/super-admin/auth/refresh-token.sh

# 4. Logout
./curl/super-admin/auth/logout.sh
```

#### Super Admins Management

```bash
# 1. Create a new super admin (requires super-admin role)
./curl/super-admin/super-admins/create.sh

# Copy the id from response, then:
export SUPER_ADMIN_ID="787f1297-511c-421d-899d-5b05801a812c"

# 2. List all super admins
./curl/super-admin/super-admins/list.sh

# 3. Get specific super admin
./curl/super-admin/super-admins/get.sh

# 4. Update super admin
./curl/super-admin/super-admins/update.sh

# 5. Delete super admin
./curl/super-admin/super-admins/delete.sh
```

## Windows Usage

On Windows (PowerShell), you can run the scripts using Git Bash or WSL, or modify them to use PowerShell syntax:

```powershell
# Set variables
$env:BASE_URL = "http://localhost:4000"
$env:ACCESS_TOKEN = "your-token-here"

# Run curl command directly
curl -X GET "$env:BASE_URL/api/v1/superadmin/auth/me" `
  -H "Authorization: Bearer $env:ACCESS_TOKEN"
```

## Script Variables

All scripts use the following environment variables:

- `BASE_URL` - Base API URL (default: `http://localhost:4000`)
- `ACCESS_TOKEN` - JWT access token (required for protected endpoints)
- `REFRESH_TOKEN` - JWT refresh token (for token refresh)
- `SUPER_ADMIN_ID` - UUID of super admin (for get/update/delete operations)

## Customizing Scripts

You can edit any script to customize:
- Request body data
- Query parameters
- Headers
- Endpoint URLs

## Example Response

After running `login.sh`, you'll get a response like:

```json
{
  "ok": true,
  "data": {
    "superAdmin": {
      "id": "787f1297-511c-421d-899d-5b05801a812c",
      "email": "support@dynamixzone.com",
      "name": "First Super Admin",
      "role": "super-admin",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

Copy the tokens and set them as environment variables before running other scripts.

