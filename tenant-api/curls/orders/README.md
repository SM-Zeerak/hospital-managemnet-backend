# Orders Module - cURL Examples

This directory contains cURL examples for all Orders module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

3. Set order ID for sub-resource operations:
   ```bash
   export ORDER_ID="your-order-uuid-here"
   ```

## Order Statistics

### Get Order Statistics
```bash
./stats.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/stats`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Order Statistics",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "total": {
      "value": 200,
      "change": 5.2,
      "period": "Past month"
    },
    "draft": {
      "value": 30,
      "change": -2.1,
      "period": "Past month"
    },
    "awaitingDispatch": {
      "value": 50,
      "change": 8.3,
      "period": "Past month"
    },
    "scheduled": {
      "value": 40,
      "change": 12.5,
      "period": "Past month"
    },
    "inTransit": {
      "value": 60,
      "change": 15.0,
      "period": "Past month"
    },
    "delivered": {
      "value": 15,
      "change": -5.0,
      "period": "Past month"
    },
    "cancelled": {
      "value": 5,
      "change": -1.0,
      "period": "Past month"
    }
  }
}
```

**Note:** The `change` field represents the percentage change from the previous period. Positive values indicate an increase, negative values indicate a decrease.

**Required Permissions:** `orders.read`

## Order CRUD Operations

### List All Orders
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/orders`

**Query Parameters:**
- `search` (string, optional): Search term for order number, customer name, reference, status notes
- `status` (enum, optional): `draft` | `awaiting_dispatch` | `scheduled` | `in_transit` | `delivered` | `cancelled`
- `orderStatus` (string, optional): Order status string
- `secondaryStatus` (string, optional): Secondary status string
- `leadId` (UUID, optional): Filter by associated lead
- `quoteId` (UUID, optional): Filter by associated quote
- `assignedTo` (UUID, optional): Filter by assigned user
- `assignedDepartmentId` (UUID, optional): Filter by assigned user's department
- `assignedRoles` (string, optional): Comma-separated role names (e.g., "admin,sales,dispatch")
- `transportType` (enum, optional): `Open` | `Enclosed` | `Driveaway` | `Other` | `DD` | `SDL` | `HS` | `SD` | `RGN` | `RGNE`
- `dateFrom` (ISO 8601, optional): Filter by creation date from
- `dateTo` (ISO 8601, optional): Filter by creation date to
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` | `orderCreated` | `pickupDate` | `deliveryDate` | `amount` | `status` | `orderNumber` (default: `updatedAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Orders",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "orderNumber": "ORD1234567890",
      "orderStatus": "awaiting_dispatch",
      "secondaryStatus": "Awaiting Customer Signature",
      "status": "awaiting_dispatch",
      "totalTariff": 1500.00,
      "carrierPay": 1200.00,
      "brokerFee": 300.00,
      "customerName": "John Doe",
      "customerPhone": "4709190737",
      "customerEmail": "john@example.com",
      "assignedTo": "user-uuid",
      "assignedTeam": "Sales",
      "transportType": "Open",
      "pickupDate": "2025-12-15T00:00:00Z",
      "deliveryDate": "2025-12-20T00:00:00Z",
      "createdAt": "2023-11-13T00:00:00.000Z",
      "updatedAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 50,
    "offset": 0,
    "pages": 4
  },
  "stats": {
    "total": { "value": 200, "change": 5.2, "period": "Past month" },
    "draft": { "value": 30, "change": -2.1, "period": "Past month" },
    "awaitingDispatch": { "value": 50, "change": 8.3, "period": "Past month" },
    "scheduled": { "value": 40, "change": 12.5, "period": "Past month" },
    "inTransit": { "value": 60, "change": 15.0, "period": "Past month" },
    "delivered": { "value": 15, "change": -5.0, "period": "Past month" },
    "cancelled": { "value": 5, "change": -1.0, "period": "Past month" }
  }
}
```

**Required Permissions:** `orders.read`

### Create Order
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/orders`

**Request Body:**
```json
{
  "quoteId": "quote-uuid",
  "leadId": "lead-uuid",
  "orderNumber": "ORD1234567890",
  "orderStatus": "draft",
  "secondaryStatus": "Awaiting Customer Signature",
  "transportType": "Open",
  "firstAvailablePickup": "2025-12-15T00:00:00Z",
  "totalTariff": 1500.00,
  "carrierPay": 1200.00,
  "carrierPayTerms": "COD - Cash",
  "brokerFee": 300.00,
  "brokerFeeTerms": "Charge on Dispatch",
  "specialTerms": "Special handling required",
  "customerName": "John Doe",
  "customerPhone": "4709190737",
  "customerEmail": "john@example.com",
  "assignedTo": "user-uuid",
  "assignedTeam": "Sales",
  "requireCcOnEdocFrom": false,
  "suppressNotifications": false,
  "originCity": "Atlanta",
  "originState": "GA",
  "originPostalCode": "30301",
  "originCountry": "USA",
  "originContactName": "Origin Contact",
  "originContactPhone": "404-555-1234",
  "destinationCity": "Dallas",
  "destinationState": "TX",
  "destinationPostalCode": "75201",
  "destinationCountry": "USA",
  "destinationContactName": "Destination Contact",
  "destinationContactPhone": "214-555-5678",
  "pickupDate": "2025-12-15T00:00:00Z",
  "deliveryDate": "2025-12-20T00:00:00Z"
}
```

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Order",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD1234567890",
    "orderStatus": "draft",
    "status": "awaiting_dispatch",
    "totalTariff": 1500.00,
    "carrierPay": 1200.00,
    "brokerFee": 300.00,
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Required Permissions:** `orders.create`

### Get Order by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Order",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD1234567890",
    "orderStatus": "awaiting_dispatch",
    "secondaryStatus": "Awaiting Customer Signature",
    "status": "awaiting_dispatch",
    "totalTariff": 1500.00,
    "carrierPay": 1200.00,
    "brokerFee": 300.00,
    "customerName": "John Doe",
    "customerPhone": "4709190737",
    "customerEmail": "john@example.com",
    "vehicles": [],
    "internalNotes": [],
    "changeHistory": [],
    "signatureHistory": [],
    "payments": [],
    "assignedUser": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  },
  "stats": {
    "total": { "value": 200, "change": 5.2, "period": "Past month" },
    "draft": { "value": 30, "change": -2.1, "period": "Past month" },
    "awaitingDispatch": { "value": 50, "change": 8.3, "period": "Past month" },
    "scheduled": { "value": 40, "change": 12.5, "period": "Past month" },
    "inTransit": { "value": 60, "change": 15.0, "period": "Past month" },
    "delivered": { "value": 15, "change": -5.0, "period": "Past month" },
    "cancelled": { "value": 5, "change": -1.0, "period": "Past month" }
  }
}
```

**Required Permissions:** `orders.read`

### Update Order
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/orders/:id`

**Request Body:**
```json
{
  "orderStatus": "awaiting_dispatch",
  "secondaryStatus": "Awaiting Customer Signature",
  "totalTariff": 1600.00,
  "carrierPay": 1300.00,
  "brokerFee": 300.00,
  "statusNotes": "Updated order details",
  "pickupDate": "2025-12-16T00:00:00Z",
  "deliveryDate": "2025-12-21T00:00:00Z"
}
```

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Update Order",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD1234567890",
    "orderStatus": "awaiting_dispatch",
    "totalTariff": 1600.00,
    "carrierPay": 1300.00,
    "brokerFee": 300.00,
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Required Permissions:** `orders.update`

### Delete Order
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/orders/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Delete Order",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Required Permissions:** `orders.delete`

## Order Vehicles

### List Order Vehicles
```bash
./vehicles-list.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/vehicles`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Order Vehicles",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "vehicle-uuid",
      "orderId": "order-uuid",
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

**Required Permissions:** `orders.read`

### Create Order Vehicle
```bash
./vehicles-create.sh
```
**Endpoint:** `POST /api/v1/tenant/orders/:orderId/vehicles`

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

**Required Permissions:** `orders.create`

### Get Order Vehicle by ID
```bash
./vehicles-get.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/vehicles/:vehicleId`

**Required Permissions:** `orders.read`

### Update Order Vehicle
```bash
./vehicles-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/orders/:orderId/vehicles/:vehicleId`

**Request Body:**
```json
{
  "carrierPay": 1300.00,
  "brokerFee": 350.00,
  "notes": "Updated vehicle notes"
}
```

**Required Permissions:** `orders.update`

### Delete Order Vehicle
```bash
./vehicles-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/orders/:orderId/vehicles/:vehicleId`

**Required Permissions:** `orders.delete`

## Order Internal Notes

### List Order Internal Notes
```bash
./internal-notes-list.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/internal-notes`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Order Internal Notes",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "note-uuid",
      "orderId": "order-uuid",
      "note": "Internal note about this order",
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

**Required Permissions:** `orders.read`

### Create Order Internal Note
```bash
./internal-notes-create.sh
```
**Endpoint:** `POST /api/v1/tenant/orders/:orderId/internal-notes`

**Request Body:**
```json
{
  "note": "Internal note about this order"
}
```

**Required Permissions:** `orders.create`

### Get Order Internal Note by ID
```bash
./internal-notes-get.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/internal-notes/:noteId`

**Required Permissions:** `orders.read`

### Update Order Internal Note
```bash
./internal-notes-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/orders/:orderId/internal-notes/:noteId`

**Request Body:**
```json
{
  "note": "Updated internal note"
}
```

**Required Permissions:** `orders.update`

### Delete Order Internal Note
```bash
./internal-notes-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/orders/:orderId/internal-notes/:noteId`

**Required Permissions:** `orders.delete`

## Order Change History

### List Order Change History
```bash
./change-history-list.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/change-history`

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
  "invokedMethod": "List Order Change History",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "history-uuid",
      "orderId": "order-uuid",
      "userId": "user-uuid",
      "userName": "John Doe",
      "actionType": "Order updated",
      "disposition": "Success",
      "description": "Updated fields: totalTariff, carrierPay",
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

**Required Permissions:** `orders.read`

## Order Signature History

### List Order Signature History
```bash
./signature-history-list.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/signature-history`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Order Signature History",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "signature-uuid",
      "orderId": "order-uuid",
      "signedDate": "2023-11-13T00:00:00.000Z",
      "signedBy": "John Doe",
      "signatureType": "original",
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

**Required Permissions:** `orders.read`

### Create Order Signature History
```bash
./signature-history-create.sh
```
**Endpoint:** `POST /api/v1/tenant/orders/:orderId/signature-history`

**Request Body:**
```json
{
  "signedBy": "John Doe",
  "signatureType": "original",
  "signedDate": "2025-12-10T10:00:00Z"
}
```

**Signature Types:**
- `original`: Original signature
- `change_order`: Change order signature
- `amendment`: Amendment signature

**Required Permissions:** `orders.create`

### Get Order Signature History by ID
```bash
./signature-history-get.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/signature-history/:signatureId`

**Required Permissions:** `orders.read`

### Update Order Signature History
```bash
./signature-history-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/orders/:orderId/signature-history/:signatureId`

**Request Body:**
```json
{
  "signedBy": "Jane Doe",
  "signatureType": "change_order"
}
```

**Required Permissions:** `orders.update`

### Delete Order Signature History
```bash
./signature-history-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/orders/:orderId/signature-history/:signatureId`

**Required Permissions:** `orders.delete`

## Order Payments

### List Order Payments
```bash
./payments-list.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/payments`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Order Payments",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "payment-uuid",
      "orderId": "order-uuid",
      "paymentType": "Customer Owes Broker",
      "amount": 300.00,
      "paymentDate": "2023-11-13T00:00:00.000Z",
      "description": "Broker fee payment",
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

**Payment Types:**
- `Customer Owes Broker`: Customer owes money to broker
- `Carrier Owes Broker`: Carrier owes money to broker
- `Broker Owes Carrier`: Broker owes money to carrier
- `Broker Owes Terminal`: Broker owes money to terminal

**Required Permissions:** `orders.read`

### Create Order Payment
```bash
./payments-create.sh
```
**Endpoint:** `POST /api/v1/tenant/orders/:orderId/payments`

**Request Body:**
```json
{
  "paymentType": "Customer Owes Broker",
  "amount": 300.00,
  "paymentDate": "2025-12-10T10:00:00Z",
  "description": "Broker fee payment"
}
```

**Required Permissions:** `orders.create`

### Get Order Payment by ID
```bash
./payments-get.sh
```
**Endpoint:** `GET /api/v1/tenant/orders/:orderId/payments/:paymentId`

**Required Permissions:** `orders.read`

### Update Order Payment
```bash
./payments-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/orders/:orderId/payments/:paymentId`

**Request Body:**
```json
{
  "amount": 350.00,
  "description": "Updated payment description"
}
```

**Required Permissions:** `orders.update`

### Delete Order Payment
```bash
./payments-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/orders/:orderId/payments/:paymentId`

**Required Permissions:** `orders.delete`

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
- The `orderNumber` field is auto-generated if not provided
- Orders can be created from approved quotes or directly from leads
- Change history is automatically recorded for all order updates
- Signature history tracks customer signatures on order documents
- Payment history tracks all financial transactions related to an order
- All list endpoints support pagination with `limit` and `offset`
- All list endpoints return stats in the response for analytics

