# Roles Module - cURL Examples

This directory contains cURL examples for all Roles module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Role CRUD Operations

### List All Roles
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/roles`

**Query Parameters:**
- `search` (string, optional): Search term for name or description
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `name` | `createdAt` | `updatedAt` (default: `createdAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Roles",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "name": "sales",
      "description": "Sales Role",
      "permissionEntities": [
        {
          "id": "uuid",
          "key": "leads.read",
          "name": "Read Leads",
          "description": "Permission to read leads"
        }
      ],
      "createdAt": "2023-10-01T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1
  }
}
```

### Create Role
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/roles`

**Request Body:**
```json
{
  "name": "sales-manager",
  "description": "Sales Manager Role",
  "permissionIds": ["permission-uuid-1", "permission-uuid-2"]
}
```

**Required Permissions:** `roles.create` + `admin` or `sub-admin` role

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Role",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "name": "sales-manager",
    "description": "Sales Manager Role",
    "permissionEntities": [
      {
        "id": "permission-uuid-1",
        "key": "leads.read",
        "name": "Read Leads"
      },
      {
        "id": "permission-uuid-2",
        "key": "leads.create",
        "name": "Create Leads"
      }
    ],
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

### Get Role by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/roles/:id`

**Required Permissions:** `roles.read`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Role",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "name": "sales-manager",
    "description": "Sales Manager Role",
    "permissionEntities": [...],
    "createdAt": "2023-10-01T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

### Update Role
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/roles/:id`

**Request Body:** (All fields optional)
```json
{
  "name": "sales-manager",
  "description": "Updated Sales Manager Role",
  "permissionIds": ["permission-uuid-1", "permission-uuid-2", "permission-uuid-3"]
}
```

**Note:** To remove all permissions, pass an empty array: `"permissionIds": []`

**Required Permissions:** `roles.update`

### Delete Role
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/roles/:id`

**Required Permissions:** `roles.delete` + `admin` or `sub-admin` role

## Role Structure

### Role Object
```json
{
  "id": "uuid",
  "name": "sales-manager",
  "description": "Sales Manager Role",
  "permissionEntities": [
    {
      "id": "uuid",
      "key": "leads.read",
      "name": "Read Leads",
      "description": "Permission to read leads",
      "createdAt": "2023-10-01T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "createdAt": "2023-10-01T00:00:00.000Z",
  "updatedAt": "2023-11-13T00:00:00.000Z"
}
```

## Socket Events

The following socket events are emitted for real-time updates:

- `role.created` - When a new role is created
- `role.updated` - When a role is updated
- `role.deleted` - When a role is deleted

## Error Responses

All endpoints return errors in the following format:

```json
{
  "ok": false,
  "status": 400,
  "invokedMethod": "Method Name",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "requestId": "request-id"
  }
}
```

Common error codes:
- `NOT_FOUND` - Role not found
- `BAD_REQUEST` - Invalid request data (e.g., duplicate name, invalid permission IDs)
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

