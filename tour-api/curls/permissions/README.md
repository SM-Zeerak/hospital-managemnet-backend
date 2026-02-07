# Permissions Module - cURL Examples

This directory contains cURL examples for all Permissions module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Permission CRUD Operations

### List All Permissions
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/permissions`

**Query Parameters:**
- `search` (string, optional): Search term for key, name, or description
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `key` | `name` | `createdAt` | `updatedAt` (default: `key`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `ASC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Permissions",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "key": "users.read",
      "name": "Read Users",
      "description": "Permission to read user information",
      "createdAt": "2023-10-01T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 50,
    "totalPages": 1
  }
}
```

### Create Permission
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/permissions`

**Request Body:**
```json
{
  "key": "users.read",
  "name": "Read Users",
  "description": "Permission to read user information"
}
```

**Required Permissions:** `permissions.create` + `admin` or `sub-admin` role

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Permission",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "key": "users.read",
    "name": "Read Users",
    "description": "Permission to read user information",
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

### Get Permission by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/permissions/:id`

**Required Permissions:** `permissions.read`

### Update Permission
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/permissions/:id`

**Request Body:** (All fields optional)
```json
{
  "name": "Read Users",
  "description": "Updated permission to read user information"
}
```

**Note:** The `key` field cannot be updated once created.

**Required Permissions:** `permissions.update`

### Delete Permission
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/permissions/:id`

**Required Permissions:** `permissions.delete` + `admin` or `sub-admin` role

## Permission Structure

### Permission Object
```json
{
  "id": "uuid",
  "key": "users.read",
  "name": "Read Users",
  "description": "Permission to read user information",
  "createdAt": "2023-10-01T00:00:00.000Z",
  "updatedAt": "2023-11-13T00:00:00.000Z"
}
```

## Permission Key Format

Permission keys typically follow the pattern: `{resource}.{action}`

Examples:
- `users.read` - Read users
- `users.create` - Create users
- `users.update` - Update users
- `users.delete` - Delete users
- `leads.read` - Read leads
- `leads.create` - Create leads
- `carriers.read` - Read carriers
- `departments.read` - Read departments
- `roles.read` - Read roles
- `permissions.read` - Read permissions

## Socket Events

The following socket events are emitted for real-time updates:

- `permission.created` - When a new permission is created
- `permission.updated` - When a permission is updated
- `permission.deleted` - When a permission is deleted

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
- `NOT_FOUND` - Permission not found
- `BAD_REQUEST` - Invalid request data (e.g., duplicate key)
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

