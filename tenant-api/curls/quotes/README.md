# Quotes Module - cURL Examples

This directory contains cURL examples for all Quotes module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Quote Statistics

### Get Quote Statistics
```bash
./stats.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/stats`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Quote Statistics",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "total": {
      "value": 150,
      "change": 5.2,
      "period": "Past month"
    },
    "draft": {
      "value": 45,
      "change": -2.1,
      "period": "Past month"
    },
    "pendingApproval": {
      "value": 60,
      "change": 8.3,
      "period": "Past month"
    },
    "approved": {
      "value": 35,
      "change": 12.5,
      "period": "Past month"
    },
    "rejected": {
      "value": 10,
      "change": -5.0,
      "period": "Past month"
    }
  }
}
```

**Note:** The `change` field represents the percentage change from the previous period. Positive values indicate an increase, negative values indicate a decrease.

**Required Permissions:** `quotes.read`

## Quote CRUD Operations

### List All Quotes
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes`

**Query Parameters:**
- `search` (string, optional): Search term for quote number, customer name, phone, company name, notes
- `status` (enum, optional): `New` | `Sales Campaign` | `On Hold` | `Hot` | `Warm` | `Cold` | `VM` | `Email` | `Text` | `Red` | `Blue` | `Green` | `Yellow` | `Do not text` | `Booking Link Sent` | `Followup Campaign Set` | `Repeat Customer Campaign` | `Archived`
- `quoteStatus` (string, optional): Quote status string (same as status options)
- `leadId` (UUID, optional): Filter by associated lead
- `assignedUser` (UUID, optional): Filter by assigned user
- `transportType` (enum, optional): `Open` | `Enclosed` | `Driveaway` | `Other` | `DD` | `SDL` | `HS` | `SD` | `RGN` | `RGNE`
- `isActive` (boolean, optional): Filter by active status (default: `true` - only shows active quotes unless explicitly set to `false`)
- `dateFrom` (ISO 8601, optional): Filter by creation date from
- `dateTo` (ISO 8601, optional): Filter by creation date to
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` | `quoteCreated` | `shippingDate` | `amount` | `quoteNumber` (default: `updatedAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Quotes",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "quoteNumber": "Q1234567890",
      "quoteStatus": "New",
      "status": "New",
      "isActive": true,
      "quoteCreated": "2023-11-13T00:00:00.000Z",
      "transportType": "Open",
      "shippingDate": "2025-12-11T00:00:00.000Z",
      "customerName": "Roxana Torres",
      "customerPhone": "4709190737",
      "companyName": "Example Company",
      "amount": 1500.00,
      "costAmount": 1200.00,
      "margin": 20.00,
      "assignedUser": "user-uuid",
      "assignedTeam": "Sales",
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
    "draft": { "value": 45, "change": -2.1, "period": "Past month" },
    "pendingApproval": { "value": 60, "change": 8.3, "period": "Past month" },
    "approved": { "value": 35, "change": 12.5, "period": "Past month" },
    "rejected": { "value": 10, "change": -5.0, "period": "Past month" }
  }
}
```

**Required Permissions:** `quotes.read`

### Create Quote

There are two ways to create a quote:

#### 1. Direct Quote Creation (without leadId)
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/quotes`

**Request Body (all fields required when leadId is not provided):**
```json
{
  "transportType": "Enclosed",
  "shippingDate": "2025-12-24T19:00:00.000Z",
  "source": "Web",
  "customerPhone": "4709190737",
  "customerName": "Roxana Torres",
  "customerEmail": "roxana@example.com",
  "companyName": "Example Company",
  "customerAddress": "123 Main St",
  "customerCity": "Atlanta",
  "customerState": "GA",
  "customerPostalCode": "30301",
  "customerCountry": "USA",
  "originCity": "Shannon",
  "originState": "MS",
  "originPostalCode": "51503",
  "originCountry": "USA",
  "destinationCity": "Rockwall",
  "destinationState": "TX",
  "destinationPostalCode": "75087",
  "destinationCountry": "USA",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2024,
  "assignedUser": "user-uuid",
  "assignedTeam": "Sales",
  "amount": 1500.00,
  "costAmount": 1200.00,
  "margin": 20.00,
  "notes": "Quote notes here"
}
```

**Required Fields (when leadId is not provided):**
- `transportType` (enum): Transportation type
- `make` (string): Vehicle make
- `model` (string): Vehicle model
- `year` (number): Vehicle year (1900-2100)
- `customerPhone` (string): Customer phone number
- `originCity` (string): Origin city
- `originState` (string): Origin state
- `originCountry` (string): Origin country
- `destinationCity` (string): Destination city
- `destinationState` (string): Destination state
- `destinationCountry` (string): Destination country
- `shippingDate` (ISO 8601): Shipping date

#### 2. Quote Creation from Lead (with leadId)
```bash
./create-from-lead.sh
```
**Endpoint:** `POST /api/v1/tenant/quotes`

**Request Body:**
```json
{
  "leadId": "lead-uuid",
  "quoteStatus": "New",
  "transportType": "Open",
  "shippingDate": "2025-12-11T00:00:00Z",
  "assignedUser": "user-uuid",
  "assignedTeam": "Sales",
  "amount": 1500.00,
  "costAmount": 1200.00,
  "notes": "Quote notes here"
}
```

**Note:** When `leadId` is provided, most fields are automatically populated from the lead. You can override any field by including it in the request body.

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Quote",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "quoteNumber": "Q1234567890",
    "quoteStatus": "New",
    "status": "New",
    "isActive": true,
    "quoteCreated": "2023-11-13T00:00:00.000Z",
    "transportType": "Open",
    "shippingDate": "2025-12-11T00:00:00.000Z",
    "customerName": "Roxana Torres",
    "customerPhone": "4709190737",
    "amount": 1500.00,
    "costAmount": 1200.00,
    "margin": 20.00,
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Required Permissions:** `quotes.create`

### Get Quote by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Quote",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "quoteNumber": "Q1234567890",
    "quoteStatus": "New",
    "status": "New",
    "isActive": true,
    "quoteCreated": "2023-11-13T00:00:00.000Z",
    "transportType": "Open",
    "shippingDate": "2025-12-11T00:00:00.000Z",
    "customerName": "Roxana Torres",
    "customerPhone": "4709190737",
    "amount": 1500.00,
    "costAmount": 1200.00,
    "margin": 20.00,
    "vehicles": [],
    "internalNotes": [],
    "changeHistory": [],
    "createdAt": "2023-11-13T00:00:00.000Z",
    "updatedAt": "2023-11-13T00:00:00.000Z"
  },
  "stats": {
    "total": { "value": 150, "change": 5.2, "period": "Past month" },
    "draft": { "value": 45, "change": -2.1, "period": "Past month" },
    "pendingApproval": { "value": 60, "change": 8.3, "period": "Past month" },
    "approved": { "value": 35, "change": 12.5, "period": "Past month" },
    "rejected": { "value": 10, "change": -5.0, "period": "Past month" }
  }
}
```

**Required Permissions:** `quotes.read`

### Update Quote
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/quotes/:id`

**Request Body:**
```json
{
  "status": "Hot",
  "quoteStatus": "Hot",
  "amount": 1600.00,
  "costAmount": 1250.00,
  "shipperNote": "Updated shipper note",
  "notes": "Updated notes",
  "action": "submit"
}
```

**Available Status Values:**
- `New` | `Sales Campaign` | `On Hold` | `Hot` | `Warm` | `Cold` | `VM` | `Email` | `Text` | `Red` | `Blue` | `Green` | `Yellow` | `Do not text` | `Booking Link Sent` | `Followup Campaign Set` | `Repeat Customer Campaign` | `Archived`

**Available Actions (for approval workflow):**
- `submit`: Submit quote for approval (sets `approvalStatus` to `pending_approval` or `approved`)
- `approve`: Approve quote (admin/sub-admin only) - sets `approvalStatus` to `approved`
- `reject`: Reject quote (admin/sub-admin only) - sets `approvalStatus` to `rejected`
- `cancel`: Cancel quote - sets `approvalStatus` to `cancelled` and `status` to `Archived`

**Note:** The `status` field is for business status (set by user clicking on quote), while `approvalStatus` is separate for approval workflow.

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Update Quote",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "Hot",
    "quoteStatus": "Hot",
    "approvalStatus": "pending_approval",
    "amount": 1600.00,
    "costAmount": 1250.00,
    "margin": 21.88,
    "updatedAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Required Permissions:** `quotes.update`

**Note:** Only admin or sub-admin can approve or reject quotes.

### Delete Quote
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/quotes/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Delete Quote",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Required Permissions:** `quotes.delete`

## Quote Vehicles

### List Quote Vehicles
```bash
./vehicles-list.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/:quoteId/vehicles`

**Query Parameters:**
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` (default: `createdAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Required Permissions:** `quotes.read`

### Create Quote Vehicle
```bash
./vehicles-create.sh
```
**Endpoint:** `POST /api/v1/tenant/quotes/:quoteId/vehicles`

**Request Body:**
```json
{
  "modelYear": 2020,
  "make": "Audi",
  "model": "100",
  "type": "Car",
  "inop": false,
  "carrierPay": 0.00,
  "brokerFee": 0.00,
  "vin": "WAUZZZ4G0DN123456",
  "plateNumber": "ABC123",
  "color": "Black",
  "weight": 3500.00,
  "notes": "Vehicle notes"
}
```

**Required Permissions:** `quotes.create`

### Get Quote Vehicle
```bash
./vehicles-get.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/:quoteId/vehicles/:vehicleId`

**Required Permissions:** `quotes.read`

### Update Quote Vehicle
```bash
./vehicles-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/quotes/:quoteId/vehicles/:vehicleId`

**Request Body:**
```json
{
  "carrierPay": 1200.00,
  "brokerFee": 300.00,
  "notes": "Updated vehicle notes"
}
```

**Required Permissions:** `quotes.update`

### Delete Quote Vehicle
```bash
./vehicles-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/quotes/:quoteId/vehicles/:vehicleId`

**Required Permissions:** `quotes.delete`

## Quote Internal Notes

### List Quote Internal Notes
```bash
./internal-notes-list.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/:quoteId/internal-notes`

**Query Parameters:**
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` (default: `createdAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Required Permissions:** `quotes.read`

### Create Quote Internal Note
```bash
./internal-notes-create.sh
```
**Endpoint:** `POST /api/v1/tenant/quotes/:quoteId/internal-notes`

**Request Body:**
```json
{
  "note": "Customer requested expedited shipping. Follow up needed."
}
```

**Required Permissions:** `quotes.create`

### Get Quote Internal Note
```bash
./internal-notes-get.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/:quoteId/internal-notes/:noteId`

**Required Permissions:** `quotes.read`

### Delete Quote Internal Note
```bash
./internal-notes-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/quotes/:quoteId/internal-notes/:noteId`

**Required Permissions:** `quotes.delete`

## Quote Change History

### List Quote Change History
```bash
./change-history-list.sh
```
**Endpoint:** `GET /api/v1/tenant/quotes/:quoteId/change-history`

**Query Parameters:**
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `timeStamp` | `createdAt` (default: `timeStamp`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Quote Change History",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "quoteId": "quote-uuid",
      "userId": "user-uuid",
      "userName": "John Doe",
      "actionType": "Quote created",
      "disposition": "Success",
      "description": "Quote created from lead LEAD-12345",
      "timeStamp": "2023-11-13T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "pages": 1
  }
}
```

**Required Permissions:** `quotes.read`

## Converting Lead to Quote

See the [Leads Module README](../leads/README.md#convert-lead-to-quote) for details on converting a lead to a quote.

**Endpoint:** `POST /api/v1/tenant/leads/:id/convert-to-quote`

**Required Permissions:** `leads.create`

## Converting Quote to Order

### Convert Quote to Order
```bash
./convert-to-order.sh
```
**Endpoint:** `POST /api/v1/tenant/orders` (with `quoteId` in body)

**Request Body:**
```json
{
  "quoteId": "{{QUOTE_ID}}",
  "transportType": "Enclosed",
  "firstAvailablePickup": "2025-12-15T00:00:00Z",
  "referralSource": "Website",
  "carrierPayTerms": "Cash",
  "brokerFeeTerms": "Charge on Order",
  "amount": 5000.00,
  "margin": 20.5,
  "costAmount": 4000.00,
  "pickupDate": "2025-12-15T00:00:00Z",
  "deliveryDate": "2025-12-20T00:00:00Z",
  "customerName": "John Doe",
  "assignedTo": "user-uuid"
}
```

**Required Fields:**
- `transportType` (enum): `Open` | `Enclosed` | `Driveaway` | `Other` | `DD` | `SDL` | `HS` | `SD` | `RGN` | `RGNE`
- `firstAvailablePickup` (ISO 8601): First available pickup date
- `referralSource` (string): Referral source
- `carrierPayTerms` (enum): `COD - Cash` | `COD - Check` | `Net 15` | `Net 30` | `Net 45` | `Net 60` | `Prepaid` | `Other`
- `brokerFeeTerms` (enum): `Charge on Dispatch` | `Charge on Delivery` | `Charge on Pickup` | `Prepaid` | `Other`
- `amount` (number): Order amount (can come from quote if not provided)
- `margin` (number): Margin percentage (can come from quote if not provided)
- `costAmount` (number): Cost amount (can come from quote if not provided)

**Response:**
```json
{
  "ok": true,
  "status": 201,
  "invokedMethod": "Create Order",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "order-uuid",
    "quoteId": "quote-uuid",
    "leadId": "lead-uuid",
    "status": "awaiting_dispatch",
    "amount": 5000.00,
    "marginPercent": 20.5,
    "pickupDate": "2025-12-15T00:00:00Z",
    "deliveryDate": "2025-12-20T00:00:00Z",
    "customerName": "John Doe",
    "customerReference": "REF-12345",
    "quote": {
      "id": "quote-uuid",
      "quoteNumber": "Q1234567890ABC"
    },
    "lead": {
      "id": "lead-uuid",
      "leadNumber": "LEAD-12345"
    },
    "createdAt": "2023-11-13T00:00:00.000Z"
  }
}
```

**Important Notes:**
- **REQUIRED**: `transportType`, `firstAvailablePickup`, `referralSource`, `carrierPayTerms`, and `brokerFeeTerms` must be provided in the request body
- **REQUIRED**: Either the quote must have `amount`, `margin`, and `costAmount` fields, OR they must be provided in the request body
- The quote's `isActive` is set to `false` (quote becomes inactive but remains in system)
- Inactive quotes will NOT appear in default list/get endpoints unless `?isActive=false` is explicitly requested
- All quote data (customer, origin, destination, vehicles) is copied to the order
- The `leadId` is automatically set from the quote's `leadId`
- Socket event `order.created` is emitted upon successful conversion

**Required Permissions:** `orders.create`

**Error Responses:**
- `404 NOT_FOUND`: Quote not found
- `400 BAD_REQUEST`: Quote is missing required fields (`amount`, `margin`, or `costAmount`)
- `400 BAD_REQUEST`: Missing required field error with code `MISSING_REQUIRED_FIELD`

## Notes

- All endpoints require authentication via Bearer token
- All timestamps are in ISO 8601 format
- Quote numbers are auto-generated if not provided
- Margin is automatically calculated from amount and costAmount
- Quotes can be created with or without an associated lead (`leadId` is optional)
- When creating a quote without `leadId`, all lead-related fields (transportType, make, model, year, customer info, origin, destination, shippingDate) become mandatory
- When creating a quote with `leadId`, most fields are automatically populated from the lead, but can be overridden
- **Default list/get endpoints only show active quotes** (`isActive=true`) unless `?isActive=false` is explicitly requested
- Inactive quotes remain in the system but are hidden from default views
- Quote business status (`status`) is separate from approval status (`approvalStatus`)
- Business statuses are user-selectable (New, Hot, Warm, Cold, etc.)
- Approval statuses are workflow-based (draft, pending_approval, approved, etc.)
- Converting quote to order requires `amount`, `margin`, and `costAmount` fields
- When converted to order, quote's `isActive` is set to `false` (quote becomes inactive)
- Role-based filtering: Lower-level users cannot see quotes assigned to higher-level users

