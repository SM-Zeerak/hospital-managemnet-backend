# Dispatch Module - cURL Examples

This directory contains cURL examples for all Dispatch module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

3. Set dispatch ID for operations:
   ```bash
   export DISPATCH_ID="your-dispatch-uuid-here"
   ```

## Dispatch Statistics

### Get Dispatch Statistics
```bash
./stats.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/stats`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Dispatch Statistics",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "total": {
      "value": 150,
      "change": 5.2,
      "period": "Past month"
    },
    "unposted": {
      "value": 20,
      "change": -2.1,
      "period": "Past month"
    },
    "posted": {
      "value": 30,
      "change": 8.3,
      "period": "Past month"
    },
    "dispatched": {
      "value": 40,
      "change": 12.5,
      "period": "Past month"
    },
    "pickedUp": {
      "value": 35,
      "change": 15.0,
      "period": "Past month"
    },
    "inTransit": {
      "value": 20,
      "change": 10.0,
      "period": "Past month"
    },
    "delivered": {
      "value": 5,
      "change": -5.0,
      "period": "Past month"
    },
    "cancelled": {
      "value": 0,
      "change": 0,
      "period": "Past month"
    }
  }
}
```

**Note:** The `change` field represents the percentage change from the previous period. Positive values indicate an increase, negative values indicate a decrease.

**Required Permissions:** `dispatch.read`

## Dispatch CRUD Operations

### List All Dispatches
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch`

**Query Parameters:**
- `search` (string, optional): Search term for customer name, carrier name, origin, destination, notes
- `status` (enum, optional): `unposted` | `posted` | `dispatched` | `picked_up` | `in_transit` | `delivered` | `cancelled`
- `secondaryStatus` (string, optional): Secondary status string
- `orderId` (UUID, optional): Filter by associated order
- `carrierId` (UUID, optional): Filter by associated carrier
- `assignedTo` (UUID, optional): Filter by assigned user
- `assignedDepartmentId` (UUID, optional): Filter by assigned user's department
- `assignedRoles` (string, optional): Comma-separated role names (e.g., "admin,dispatch")
- `transportType` (enum, optional): `Open` | `Enclosed` | `Driveaway` | `Other` | `DD` | `SDL` | `HS` | `SD` | `RGN` | `RGNE`
- `dateFrom` (ISO 8601, optional): Filter by creation date from
- `dateTo` (ISO 8601, optional): Filter by creation date to
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` | `status` | `pickupDate` | `deliveryDate` | `dispatchedAt` | `pickedUpAt` | `deliveredAt` (default: `updatedAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Dispatches",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "orderId": "order-uuid",
      "carrierId": "carrier-uuid",
      "carrierName": "ABC Transport",
      "status": "dispatched",
      "secondaryStatus": "Carrier Confirmed",
      "customerName": "John Doe",
      "customerPhone": "4709190737",
      "customerEmail": "john@example.com",
      "vehicles": "2020 Toyota Camry",
      "origin": "Atlanta, GA 30301",
      "destination": "Dallas, TX 75201",
      "transportType": "Open",
      "totalTariff": 1500.00,
      "carrierPay": 1200.00,
      "brokerFee": 300.00,
      "pickupDate": "2025-12-15T08:00:00Z",
      "deliveryDate": "2025-12-20T17:00:00Z",
      "dispatchedAt": "2025-12-15T10:00:00Z",
      "createdAt": "2023-11-13T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "pages": 3
  },
  "stats": {
    "total": { "value": 150, "change": 5.2, "period": "Past month" },
    "unposted": { "value": 20, "change": -2.1, "period": "Past month" },
    "posted": { "value": 30, "change": 8.3, "period": "Past month" },
    "dispatched": { "value": 40, "change": 12.5, "period": "Past month" },
    "pickedUp": { "value": 35, "change": 15.0, "period": "Past month" },
    "inTransit": { "value": 20, "change": 10.0, "period": "Past month" },
    "delivered": { "value": 5, "change": -5.0, "period": "Past month" },
    "cancelled": { "value": 0, "change": 0, "period": "Past month" }
  }
}
```

**Required Permissions:** `dispatch.read`

### Create Dispatch
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/dispatch`

**Request Body:**
```json
{
  "orderId": "order-uuid",
  "carrierId": "carrier-uuid",
  "carrierName": "ABC Transport",
  "status": "unposted",
  "secondaryStatus": "Awaiting Carrier Confirmation",
  "customerName": "John Doe",
  "customerPhone": "4709190737",
  "customerEmail": "john@example.com",
  "vehicles": "2020 Toyota Camry",
  "origin": "Atlanta, GA 30301",
  "destination": "Dallas, TX 75201",
  "shipDate": "2025-12-15T00:00:00Z",
  "firstAvailablePickup": "2025-12-15T08:00:00Z",
  "transportType": "Open",
  "priceExpiration": "2025-12-20T00:00:00Z",
  "totalTariff": 1500.00,
  "carrierPay": 1200.00,
  "brokerFee": 300.00,
  "pickupDate": "2025-12-15T08:00:00Z",
  "pickupWindow": "8:00 AM - 12:00 PM",
  "deliveryDate": "2025-12-20T17:00:00Z",
  "deliveryWindow": "2:00 PM - 6:00 PM",
  "leadSource": "Leads Pro",
  "assignedTo": "user-uuid",
  "referralSource": "Referral",
  "primaryRep": "Sales Rep Name",
  "assignedTeam": "Dispatch Team",
  "notes": "Handle with care"
}
```

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Dispatch",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "order-uuid",
    "status": "unposted",
    "carrierName": "ABC Transport",
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Required Permissions:** `dispatch.create`

### Get Dispatch by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Dispatch",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": "order-uuid",
    "carrierId": "carrier-uuid",
    "carrierName": "ABC Transport",
    "status": "dispatched",
    "secondaryStatus": "Carrier Confirmed",
    "customerName": "John Doe",
    "customerPhone": "4709190737",
    "customerEmail": "john@example.com",
    "vehicles": "2020 Toyota Camry",
    "origin": "Atlanta, GA 30301",
    "destination": "Dallas, TX 75201",
    "transportType": "Open",
    "totalTariff": 1500.00,
    "carrierPay": 1200.00,
    "brokerFee": 300.00,
    "pickupDate": "2025-12-15T08:00:00Z",
    "deliveryDate": "2025-12-20T17:00:00Z",
    "dispatchedAt": "2025-12-15T10:00:00Z",
    "order": {
      "id": "order-uuid",
      "orderNumber": "ORD1234567890"
    },
    "carrierEntity": {
      "id": "carrier-uuid",
      "name": "ABC Transport"
    },
    "assignedUserEntity": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  },
  "stats": {
    "total": { "value": 150, "change": 5.2, "period": "Past month" },
    "unposted": { "value": 20, "change": -2.1, "period": "Past month" },
    "posted": { "value": 30, "change": 8.3, "period": "Past month" },
    "dispatched": { "value": 40, "change": 12.5, "period": "Past month" },
    "pickedUp": { "value": 35, "change": 15.0, "period": "Past month" },
    "inTransit": { "value": 20, "change": 10.0, "period": "Past month" },
    "delivered": { "value": 5, "change": -5.0, "period": "Past month" },
    "cancelled": { "value": 0, "change": 0, "period": "Past month" }
  }
}
```

**Required Permissions:** `dispatch.read`

### Update Dispatch
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/dispatch/:id`

**Request Body:**
```json
{
  "status": "dispatched",
  "secondaryStatus": "Carrier Confirmed",
  "dispatchedAt": "2025-12-15T10:00:00Z",
  "carrierName": "Updated Carrier Name",
  "notes": "Updated dispatch notes"
}
```

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Update Dispatch",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "dispatched",
    "dispatchedAt": "2025-12-15T10:00:00Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Required Permissions:** `dispatch.update`

### Delete Dispatch
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/dispatch/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Delete Dispatch",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Required Permissions:** `dispatch.delete`

## Error Responses

All endpoints return consistent error responses:

```json
{
  "ok": false,
  "status": 400,
  "invokedMethod": "Method Name",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field validation failed",
    "details": [],
    "requestId": "request-uuid"
  }
}
```

## Dispatch Vehicles

### List Dispatch Vehicles
```bash
./vehicles-list.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/:dispatchId/vehicles`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Dispatch Vehicles",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "vehicle-uuid",
      "dispatchId": "dispatch-uuid",
      "modelYear": 2020,
      "make": "Toyota",
      "model": "Camry",
      "type": "Sedan",
      "inop": false,
      "carrierPay": 1200.00,
      "brokerFee": 300.00,
      "vin": "1HGBH41JXMN109186",
      "plateNumber": "ABC123",
      "color": "Blue",
      "weight": 3500.00,
      "status": "active",
      "createdAt": "2023-11-13T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "pages": 1
  }
}
```

**Required Permissions:** `dispatch.read`

### Create Dispatch Vehicle
```bash
./vehicles-create.sh
```
**Endpoint:** `POST /api/v1/tenant/dispatch/:dispatchId/vehicles`

**Request Body:**
```json
{
  "modelYear": 2020,
  "make": "Toyota",
  "model": "Camry",
  "type": "Sedan",
  "inop": false,
  "carrierPay": 1200.00,
  "brokerFee": 300.00,
  "vin": "1HGBH41JXMN109186",
  "plateNumber": "ABC123",
  "color": "Blue",
  "weight": 3500.00,
  "notes": "Vehicle notes",
  "status": "active"
}
```

**Required Permissions:** `dispatch.create`

### Get Dispatch Vehicle by ID
```bash
./vehicles-get.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/:dispatchId/vehicles/:vehicleId`

**Required Permissions:** `dispatch.read`

### Update Dispatch Vehicle
```bash
./vehicles-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/dispatch/:dispatchId/vehicles/:vehicleId`

**Required Permissions:** `dispatch.update`

### Delete Dispatch Vehicle
```bash
./vehicles-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/dispatch/:dispatchId/vehicles/:vehicleId`

**Required Permissions:** `dispatch.delete`

## Dispatch Internal Notes

### List Dispatch Internal Notes
```bash
./internal-notes-list.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/:dispatchId/internal-notes`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Dispatch Internal Notes",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "note-uuid",
      "dispatchId": "dispatch-uuid",
      "note": "Internal note about this dispatch",
      "createdBy": "user-uuid",
      "creator": {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2023-11-13T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "pages": 1
  }
}
```

**Required Permissions:** `dispatch.read`

### Create Dispatch Internal Note
```bash
./internal-notes-create.sh
```
**Endpoint:** `POST /api/v1/tenant/dispatch/:dispatchId/internal-notes`

**Request Body:**
```json
{
  "note": "Internal note about this dispatch"
}
```

**Required Permissions:** `dispatch.create`

### Get Dispatch Internal Note by ID
```bash
./internal-notes-get.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/:dispatchId/internal-notes/:noteId`

**Required Permissions:** `dispatch.read`

### Update Dispatch Internal Note
```bash
./internal-notes-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/dispatch/:dispatchId/internal-notes/:noteId`

**Request Body:**
```json
{
  "note": "Updated internal note"
}
```

**Required Permissions:** `dispatch.update`

### Delete Dispatch Internal Note
```bash
./internal-notes-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/dispatch/:dispatchId/internal-notes/:noteId`

**Required Permissions:** `dispatch.delete`

## Dispatch Change History

### List Dispatch Change History
```bash
./change-history-list.sh
```
**Endpoint:** `GET /api/v1/tenant/dispatch/:dispatchId/change-history`

**Query Parameters:**
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `timeStamp` | `actionType` (default: `timeStamp`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Dispatch Change History",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "history-uuid",
      "dispatchId": "dispatch-uuid",
      "userId": "user-uuid",
      "userName": "John Doe",
      "actionType": "Dispatch updated",
      "disposition": "Success",
      "description": "Updated fields: status, carrierName",
      "timeStamp": "2023-11-13T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "pages": 1
  }
}
```

**Note:** Change history is read-only and automatically recorded for all dispatch updates.

**Required Permissions:** `dispatch.read`

## Error Responses

All endpoints return consistent error responses:

```json
{
  "ok": false,
  "status": 400,
  "invokedMethod": "Method Name",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field validation failed",
    "details": [],
    "requestId": "request-uuid"
  }
}
```

## Notes

- All date fields accept ISO 8601 format strings or Date objects
- All UUID fields must be valid UUID v4 format
- Dispatch records are linked to orders via `orderId`
- Dispatch records can be linked to carriers via `carrierId`
- Status progression: `unposted` → `posted` → `dispatched` → `picked_up` → `in_transit` → `delivered`
- All list endpoints support pagination with `limit` and `offset`
- All list endpoints return stats in the response for analytics
- Department and role filtering allows filtering dispatches by assigned user's department and roles
- Role hierarchy filtering ensures users only see dispatches assigned to users with equal or lower role levels
- Change history is automatically recorded for all dispatch create, update, and delete operations
- Vehicles, internal notes, and change history are all linked to their parent dispatch record

