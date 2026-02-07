# Departments Module - cURL Examples

This directory contains cURL examples for all Departments module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Department CRUD Operations

### List All Departments
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/departments`

**Query Parameters:**
- `search` (string, optional): Search term for name or description
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `name` | `createdAt` | `updatedAt` (default: `name`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `ASC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Departments",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "name": "sales-depart",
      "description": "Sales Department",
      "createdAt": "2023-10-01T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z",
      "roles": [
        {
          "id": "role-uuid-1",
          "name": "sales",
          "description": "Sales representative"
        },
        {
          "id": "role-uuid-2",
          "name": "sales-head",
          "description": "Sales leadership"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "totalPages": 1
  }
}
```

**Note:** Each department includes a `roles` array containing all roles associated with that department. Roles are directly linked to departments via the `department_id` field in the `roles` table.

### Create Department
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/departments`

**Request Body:**
```json
{
  "name": "Sales",
  "description": "Sales Department"
}
```

**Required Permissions:** `departments.create` + `admin` or `sub-admin` role

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Department",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "name": "Sales",
    "description": "Sales Department",
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

### Get Department by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/departments/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Department",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "name": "admin-depart",
    "description": "Administrative operations",
    "createdAt": "2023-10-01T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z",
    "roles": [
      {
        "id": "role-uuid-1",
        "name": "admin",
        "description": "Tenant administrator"
      },
      {
        "id": "role-uuid-2",
        "name": "sub-admin",
        "description": "Deputy administrator"
      }
    ]
  }
}
```

**Required Permissions:** `departments.read`

### Update Department
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/departments/:id`

**Request Body:** (All fields optional)
```json
{
  "name": "Sales Department",
  "description": "Updated description"
}
```

**Required Permissions:** `departments.update`

### Delete Department
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/departments/:id`

**Required Permissions:** `departments.delete` + `admin` or `sub-admin` role

## Department Structure

### Department Object
```json
{
  "id": "uuid",
  "name": "sales-depart",
  "description": "Sales Department",
  "createdAt": "2023-10-01T00:00:00.000Z",
  "updatedAt": "2023-11-13T00:00:00.000Z",
  "roles": [
    {
      "id": "role-uuid",
      "name": "sales",
      "description": "Sales representative"
    }
  ]
}
```

**Note:** The `roles` array contains all roles that belong to this department. Roles are associated with departments via the `department_id` field in the `roles` table.

## Socket Events

The following socket events are emitted for real-time updates:

- `department.created` - When a new department is created
- `department.updated` - When a department is updated
- `department.deleted` - When a department is deleted

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
- `NOT_FOUND` - Department not found
- `BAD_REQUEST` - Invalid request data (e.g., duplicate name)
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

