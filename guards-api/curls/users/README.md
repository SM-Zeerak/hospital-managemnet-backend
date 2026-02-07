# Users Module - cURL Examples

This directory contains cURL examples for all Users module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## User Statistics

### Get User Statistics
```bash
./stats.sh
```
**Endpoint:** `GET /api/v1/tenant/users/stats`

**Response:**
```json
{
  "ok": true,
  "data": {
    "total": {
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "active": {
      "value": 8,
      "change": 5,
      "period": "Past month"
    },
    "suspended": {
      "value": 3,
      "change": 5,
      "period": "Past month"
    },
    "pendingInvites": {
      "value": 5,
      "change": -5,
      "period": "Past month"
    }
  }
}
```

**Note:** The `change` field represents the percentage change from the previous month (30-60 days ago). Positive values indicate an increase, negative values indicate a decrease.

**Required Permissions:** `users.read`

## User CRUD Operations

### List Users
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/users`

**Query Parameters:**
- `search` (string, optional): Search term for name/email
- `status` (enum, optional): `active` | `suspended`
- `departmentId` (UUID, optional): Filter by department
- `roleId` (UUID, optional): Filter by role
- `dateFrom` (ISO 8601, optional): Filter by creation date from
- `dateTo` (ISO 8601, optional): Filter by creation date to
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` | `lastLoginAt` | `firstName` | `lastName` | `email` (default: `createdAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "department": {
        "id": "uuid",
        "name": "Sales"
      },
      "roles": ["sales", "sales-head"],
      "permissions": ["users.read", "leads.create"],
      "status": "active",
      "lastLoginAt": "2023-11-13T00:00:00.000Z",
      "createdAt": "2023-10-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 16,
    "limit": 50,
    "offset": 0,
    "pages": 1
  },
  "stats": {
    "total": {
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "active": {
      "value": 8,
      "change": 5,
      "period": "Past month"
    },
    "suspended": {
      "value": 3,
      "change": 5,
      "period": "Past month"
    },
    "pendingInvites": {
      "value": 5,
      "change": -5,
      "period": "Past month"
    }
  }
}
```

**Note:** The list endpoint now includes `stats` in the response, providing real-time statistics alongside the paginated user data.

### Get User by ID
```bash
./get.sh <user-id>
```
**Endpoint:** `GET /api/v1/tenant/users/:id`

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "department": {
      "id": "uuid",
      "name": "Sales"
    },
    "roles": ["sales", "sales-head"],
    "permissions": ["users.read", "leads.create"],
    "status": "active",
    "lastLoginAt": "2023-11-13T00:00:00.000Z",
    "createdAt": "2023-10-01T00:00:00.000Z"
  },
  "stats": {
    "total": {
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "active": {
      "value": 8,
      "change": 5,
      "period": "Past month"
    },
    "suspended": {
      "value": 3,
      "change": 5,
      "period": "Past month"
    },
    "pendingInvites": {
      "value": 5,
      "change": -5,
      "period": "Past month"
    }
  }
}
```

**Note:** The get endpoint now includes `stats` in the response, providing real-time statistics alongside the user data.

### Create User
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "departmentId": "uuid-or-null",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Required Permissions:** `users.create` + `admin` or `sub-admin` role

### Update User
```bash
./update.sh <user-id>
```
**Endpoint:** `PATCH /api/v1/tenant/users/:id`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "departmentId": "uuid-or-null",
  "roleIds": ["role-uuid-1"],
  "status": "active"
}
```

**Required Permissions:** `users.update`

### Activate User
```bash
./activate.sh <user-id>
```
**Endpoint:** `POST /api/v1/tenant/users/:id/activate`

**Required Permissions:** `users.update` + `admin` or `sub-admin` role

### Suspend User
```bash
./suspend.sh <user-id>
```
**Endpoint:** `POST /api/v1/tenant/users/:id/suspend`

**Required Permissions:** `users.update` + `admin` or `sub-admin` role

### Delete User
```bash
./delete.sh <user-id>
```
**Endpoint:** `DELETE /api/v1/tenant/users/:id`

**Required Permissions:** `users.delete` + `admin` role

## Bulk Operations

### Bulk User Operations
```bash
./bulk.sh
```
**Endpoint:** `POST /api/v1/tenant/users/bulk`

**Request Body:**
```json
{
  "userIds": ["uuid-1", "uuid-2"],
  "action": "suspend"
}
```

**Actions:** `activate` | `suspend` | `delete`

**Response:**
```json
{
  "ok": true,
  "data": {
    "action": "suspend",
    "results": [
      {
        "userId": "uuid-1",
        "success": true,
        "data": { /* user object */ }
      }
    ],
    "errors": [
      {
        "userId": "uuid-2",
        "error": "User not found"
      }
    ],
    "summary": {
      "total": 2,
      "successful": 1,
      "failed": 1
    }
  }
}
```

**Required Permissions:** `users.update` + `admin` or `sub-admin` role

## User Invites

### Create User Invite
```bash
./invites-create.sh
```
**Endpoint:** `POST /api/v1/tenant/users/invites`

**Request Body:**
```json
{
  "email": "invited@example.com",
  "firstName": "Invited",
  "lastName": "User",
  "departmentId": "uuid-or-null",
  "roleIds": ["role-uuid-1"]
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "email": "invited@example.com",
    "firstName": "Invited",
    "lastName": "User",
    "status": "pending",
    "expiresAt": "2023-12-15T00:00:00.000Z",
    "token": "uuid-token" // Only in development
  }
}
```

**Note:** An email will be sent to the invited user with an invitation link. The token is only exposed in non-production environments.

**Required Permissions:** `users.create` + `admin` or `sub-admin` role

### List User Invites
```bash
./invites-list.sh
```
**Endpoint:** `GET /api/v1/tenant/users/invites`

**Query Parameters:**
- `status` (enum, optional): `pending` | `accepted` | `cancelled` (default: `pending`)
- `search` (string, optional): Search term for email/name
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

### Resend User Invite
```bash
./invites-resend.sh <invite-id>
```
**Endpoint:** `POST /api/v1/tenant/users/invites/:inviteId/resend`

**Required Permissions:** `users.create` + `admin` or `sub-admin` role

### Cancel User Invite
```bash
./invites-cancel.sh <invite-id>
```
**Endpoint:** `POST /api/v1/tenant/users/invites/:inviteId/cancel`

**Required Permissions:** `users.update` + `admin` or `sub-admin` role

### Accept User Invite (Public)
```bash
./invites-accept.sh <invite-token>
```
**Endpoint:** `POST /api/v1/tenant/users/invites/accept`

**Request Body:**
```json
{
  "token": "invite-token-uuid",
  "password": "SecurePassword123!"
}
```

**Note:** This endpoint does not require authentication. The user will be created and activated upon successful acceptance.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "email": "invited@example.com",
    "firstName": "Invited",
    "lastName": "User",
    "status": "active",
    "roles": ["role-name"],
    "permissions": ["permission-key"]
  }
}
```

## User Structure

Users are organized hierarchically:
- **Users** → **Departments** → **Roles** → **Permissions**

### User Object
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "department": {
    "id": "uuid",
    "name": "Sales",
    "description": "Sales Department"
  },
  "roles": ["sales", "sales-head"],
  "permissions": ["users.read", "leads.create", "quotes.approve"],
  "status": "active",
  "lastLoginAt": "2023-11-13T00:00:00.000Z",
  "createdAt": "2023-10-01T00:00:00.000Z",
  "updatedAt": "2023-11-13T00:00:00.000Z"
}
```

### Roles and Permissions

- **Roles** are assigned to users via `roleIds` array
- **Permissions** are automatically computed from the user's roles
- Users can have multiple roles
- Permissions are deduplicated across all roles

## Socket Events

The following socket events are emitted for real-time updates:

- `user:created` - When a new user is created
- `user:updated` - When a user is updated
- `user:activated` - When a user is activated
- `user:suspended` - When a user is suspended
- `user:deleted` - When a user is deleted
- `user:bulk-operation` - When a bulk operation completes
- `user:invite:created` - When a new invite is created
- `user:invite:resent` - When an invite is resent
- `user:invite:cancelled` - When an invite is cancelled
- `user:invite:accepted` - When an invite is accepted

## Error Responses

All endpoints return errors in the following format:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "requestId": "request-id"
  }
}
```

Common error codes:
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists or conflict
- `BAD_REQUEST` - Invalid request data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

