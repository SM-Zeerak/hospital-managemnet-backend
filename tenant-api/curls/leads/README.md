# Leads Module - cURL Examples

This directory contains cURL examples for all Leads module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Lead Statistics

### Get Lead Statistics
```bash
./stats.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/stats`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Lead Statistics",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "total": {
      "value": 2384,
      "change": 2.34,
      "period": "Past month"
    },
    "new": {
      "value": 183,
      "change": -1.24,
      "period": "This Week"
    },
    "qualified": {
      "value": 945,
      "change": 2.34,
      "period": "vs last week"
    },
    "conversionRate": {
      "value": 14.5,
      "change": -1.24,
      "period": "vs last week"
    },
    "pending": {
      "value": 83,
      "change": -1.24,
      "period": "vs last week"
    },
    "disqualified": {
      "value": 233,
      "change": -1.24,
      "period": "vs last week"
    }
  }
}
```

**Note:** The `change` field represents the percentage change from the previous period. Positive values indicate an increase, negative values indicate a decrease.

**Required Permissions:** `leads.read`

## Lead CRUD Operations

### List All Leads
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/leads`

**Query Parameters:**
- `search` (string, optional): Search term for title, lead number, company name, contact name, email, phone
- `stage` (enum, optional): `new` | `contacted` | `quoted` | `order` | `dispatch` | `delivered` | `closed` | `lost`
- `isActive` (boolean, optional): Filter by active status (default: `true` - only shows active leads unless explicitly set to `false`)
- `priority` (enum, optional): `low` | `normal` | `high`
- `assignedTo` (UUID, optional): Filter by assigned user
- `transportType` (enum, optional): `Open` | `Enclosed` | `Driveaway` | `Other` | `DD` | `SDL` | `HS` | `SD` | `RGN` | `RGNE`
- `dateFrom` (ISO 8601, optional): Filter by creation date from
- `dateTo` (ISO 8601, optional): Filter by creation date to
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` | `expectedShipDate` | `expectedDeliveryDate` | `amount` | `priority` | `leadNumber` (default: `updatedAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "List Leads",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "leadNumber": "22985116",
      "title": "New Refrigerated Shipment",
      "contactName": "John Doe",
      "contactEmail": "john@example.com",
      "contactPhone": "555-0123",
      "transportType": "Open",
      "originCity": "Shannon",
      "originState": "MS",
      "originZip": "51503",
      "destinationCity": "Rockwall",
      "destinationState": "TX",
      "totalTariff": 0,
      "totalCarrierPay": 0,
      "totalBrokerFee": 0,
      "stage": "new",
      "isActive": true,
      "createdAt": "2023-10-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2384,
    "limit": 50,
    "offset": 0,
    "pages": 48
  },
  "stats": {
    "total": {
      "value": 2384,
      "change": 2.34,
      "period": "Past month"
    },
    "new": {
      "value": 183,
      "change": -1.24,
      "period": "This Week"
    },
    "qualified": {
      "value": 945,
      "change": 2.34,
      "period": "vs last week"
    },
    "conversionRate": {
      "value": 14.5,
      "change": -1.24,
      "period": "vs last week"
    },
    "pending": {
      "value": 83,
      "change": -1.24,
      "period": "vs last week"
    },
    "disqualified": {
      "value": 233,
      "change": -1.24,
      "period": "vs last week"
    }
  }
}
```

**Note:** The list endpoint now includes `stats` in the response, providing real-time statistics alongside the paginated lead data.

### Create Lead
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/tenant/leads`

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "leadNumber": "LEAD-12345",
  "source": "Rehan Afridi",
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "555-0123",
  "transportType": "Open",
  "originCity": "Shannon",
  "originState": "MS",
  "originZip": "51503",
  "originCountry": "USA",
  "destinationCity": "Rockwall",
  "destinationState": "TX",
  "destinationZip": "75087",
  "destinationCountry": "USA",
  "expectedShipDate": "2025-11-14T00:00:00Z",
  "totalTariff": 0,
  "totalCarrierPay": 0,
  "totalBrokerFee": 0,
  "assignedTo": "user-uuid",
  "assignedTeam": "Sales Team",
  "shipperNote": "Handle with care",
  "priority": "normal"
}
```

**Required Fields:**
- `make` (string): Vehicle make (e.g., "Toyota", "BMW")
- `model` (string): Vehicle model (e.g., "Camry", "Z4")
- `year` (number): Vehicle year (1900-2100)

**Optional Fields:**
- `title` (string): Lead title. If not provided, will be auto-generated as "Incoming lead from {source}" or "Incoming lead from website" if source is not provided.

**Note:** 
- If `leadNumber` is not provided, it will be auto-generated.
- If `title` is not provided, it will be auto-generated based on the source.

**Required Permissions:** `leads.create`

### Get Lead by ID
```bash
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Lead",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "leadNumber": "22985116",
    "title": "New Refrigerated Shipment",
    "contactName": "John Doe",
    "contactEmail": "john@example.com",
    "contactPhone": "555-0123",
    "transportType": "Open",
    "originCity": "Shannon",
    "originState": "MS",
    "originZip": "51503",
    "originCountry": "USA",
    "destinationCity": "Rockwall",
    "destinationState": "TX",
    "destinationZip": "75087",
    "destinationCountry": "USA",
    "totalTariff": 0,
    "totalCarrierPay": 0,
    "totalBrokerFee": 0,
    "vehicles": [...],
    "internalNotes": [...],
    "changeHistory": [...],
    "createdAt": "2023-10-01T00:00:00.000Z"
  },
  "stats": {
    "total": {
      "value": 2384,
      "change": 2.34,
      "period": "Past month"
    },
    ...
  }
}
```

**Note:** The get endpoint includes related vehicles, internal notes, change history, and stats in the response.

### Update Lead
```bash
./update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/leads/:id`

**Request Body:** (All fields optional)
```json
{
  "transportType": "Enclosed",
  "totalTariff": 1200,
  "totalCarrierPay": 1000,
  "totalBrokerFee": 200,
  "shipperNote": "Handle with care",
  "stage": "quoted",
  "stageReason": "Quote sent to customer"
}
```

**Required Permissions:** `leads.update`

### Delete Lead
```bash
./delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/leads/:id`

**Required Permissions:** `leads.delete`

### Convert Lead to Quote
```bash
./convert-to-quote.sh
```
**Endpoint:** `POST /api/v1/tenant/leads/:id/convert-to-quote`

**Request Body:** (All fields optional - additional quote data)
```json
{
  "amount": 5000.00,
  "costAmount": 4000.00,
  "quoteStatus": "New",
  "shippingDate": "2025-12-15T00:00:00Z",
  "shipperNote": "Additional notes for the quote",
  "requireCcOnEdocFrom": "customer@example.com",
  "originAddress": "123 Main St",
  "originAddress2": "Suite 100",
  "originContactName": "John Doe",
  "originContactPhone": "555-0100",
  "originContactEmail": "origin@example.com",
  "destinationAddress": "456 Oak Ave",
  "destinationAddress2": "Unit 200",
  "destinationContactName": "Jane Smith",
  "destinationContactPhone": "555-0200",
  "destinationContactEmail": "destination@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Convert Lead to Quote",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "quote-uuid",
    "quoteNumber": "Q1234567890ABC",
    "leadId": "lead-uuid",
    "quoteStatus": "New",
    "vehicles": [...],
    "internalNotes": [...],
    "changeHistory": [...]
  }
}
```

**Important Notes:**
- **REQUIRED**: The lead must have `contactName` field (returns 400 error if missing)
- **REQUIRED**: The lead must have `transportType` field (returns 400 error if missing)
- This endpoint converts a lead to a quote by copying all relevant data
- All vehicles from the lead are copied to the quote
- All internal notes from the lead are copied to the quote
- A change history entry is created in the quote
- **The lead's `isActive` is set to `false`** (lead becomes inactive but remains in system)
- Inactive leads will NOT appear in default list/get endpoints unless `?isActive=false` is explicitly requested
- Quote number is auto-generated if not provided
- Socket events emitted: `lead.converted` and `quote.created`

**Required Permissions:** `leads.create`

## Vehicles Management

### List Lead Vehicles
```bash
./vehicles-list.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/:leadId/vehicles`

**Query Parameters:**
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt` | `modelYear` | `make` | `model`
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

### Create Lead Vehicle
```bash
./vehicles-create.sh
```
**Endpoint:** `POST /api/v1/tenant/leads/:leadId/vehicles`

**Request Body:**
```json
{
  "modelYear": 2021,
  "make": "BMW",
  "model": "Z4",
  "type": "Car",
  "inop": false,
  "carrierPay": 0,
  "brokerFee": 0,
  "vin": "n/a",
  "plateNumber": "N/A",
  "color": "n/a",
  "weight": null,
  "mods": "N/A",
  "notes": "N/A",
  "addOn": "N/A",
  "lotNumber": "n/a",
  "status": "active"
}
```

### Get Lead Vehicle
```bash
./vehicles-get.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/:leadId/vehicles/:vehicleId`

### Update Lead Vehicle
```bash
./vehicles-update.sh
```
**Endpoint:** `PATCH /api/v1/tenant/leads/:leadId/vehicles/:vehicleId`

**Request Body:** (All fields optional)

### Delete Lead Vehicle
```bash
./vehicles-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/leads/:leadId/vehicles/:vehicleId`

## Internal Notes Management

### List Lead Internal Notes
```bash
./internal-notes-list.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/:leadId/internal-notes`

**Query Parameters:**
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `createdAt` | `updatedAt`
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

### Create Lead Internal Note
```bash
./internal-notes-create.sh
```
**Endpoint:** `POST /api/v1/tenant/leads/:leadId/internal-notes`

**Request Body:**
```json
{
  "note": "Customer requested expedited shipping"
}
```

### Get Lead Internal Note
```bash
./internal-notes-get.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/:leadId/internal-notes/:noteId`

### Delete Lead Internal Note
```bash
./internal-notes-delete.sh
```
**Endpoint:** `DELETE /api/v1/tenant/leads/:leadId/internal-notes/:noteId`

## Change History

### List Lead Change History
```bash
./change-history-list.sh
```
**Endpoint:** `GET /api/v1/tenant/leads/:leadId/change-history`

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
  "invokedMethod": "List Lead Change History",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "leadId": "uuid",
      "userName": "John Doe",
      "userId": "uuid",
      "actionType": "New lead created",
      "disposition": "Success",
      "description": null,
      "timeStamp": "2023-11-13T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "leadId": "uuid",
      "userName": "John Doe",
      "userId": "uuid",
      "actionType": "Email validation - LVE",
      "disposition": "OK",
      "description": null,
      "timeStamp": "2023-11-13T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "pages": 1
  }
}
```

## Lead Structure

### Lead Object
```json
{
  "id": "uuid",
  "leadNumber": "22985116",
  "title": "Incoming lead from Rehan Afridi",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "source": "Rehan Afridi",
  "stage": "new",
  "isActive": true,
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "contactPhone": "555-0123",
  "transportType": "Open",
  "originCity": "Shannon",
  "originState": "MS",
  "originZip": "51503",
  "originCountry": "USA",
  "destinationCity": "Rockwall",
  "destinationState": "TX",
  "destinationZip": "75087",
  "destinationCountry": "USA",
  "expectedShipDate": "2025-11-14T00:00:00.000Z",
  "totalTariff": 0,
  "totalCarrierPay": 0,
  "totalBrokerFee": 0,
  "assignedTo": "user-uuid",
  "assignedTeam": "Sales Team",
  "shipperNote": "Handle with care",
  "aquaRejectReason": null,
  "vehicles": [
    {
      "id": "uuid",
      "modelYear": 2021,
      "make": "BMW",
      "model": "Z4",
      "type": "Car",
      "inop": false,
      "carrierPay": 0,
      "brokerFee": 0,
      "vin": "n/a",
      "plateNumber": "N/A",
      "color": "n/a"
    }
  ],
  "internalNotes": [
    {
      "id": "uuid",
      "note": "Customer requested expedited shipping",
      "createdBy": "user-uuid",
      "createdAt": "2023-11-13T00:00:00.000Z"
    }
  ],
  "changeHistory": [
    {
      "id": "uuid",
      "actionType": "New lead created",
      "disposition": "Success",
      "timeStamp": "2023-11-13T00:00:00.000Z"
    }
  ],
  "createdAt": "2023-10-01T00:00:00.000Z",
  "updatedAt": "2023-11-13T00:00:00.000Z"
}
```

## Transport Types

Valid transport types:
- `Open`
- `Enclosed`
- `Driveaway`
- `Other`
- `DD`
- `SDL`
- `HS`
- `SD`
- `RGN`
- `RGNE`

## Lead Stages

Lead stages follow a workflow:
1. `new` - Newly created lead
2. `contacted` - Customer has been contacted
3. `quoted` - Quote has been sent
4. `order` - Converted to order
5. `dispatch` - Dispatched
6. `delivered` - Delivered
7. `closed` - Closed/Won
8. `lost` - Lost/Disqualified

**Note:** Stage transitions are validated. Leads can only progress forward (or to `lost` or `contacted` from any stage).

## Socket Events

The following socket events are emitted for real-time updates:

- `lead.created` - When a new lead is created
- `lead.updated` - When a lead is updated
- `lead.deleted` - When a lead is deleted
- `lead.vehicle.created` - When a vehicle is added to a lead
- `lead.vehicle.updated` - When a vehicle is updated
- `lead.vehicle.deleted` - When a vehicle is deleted
- `lead.note.created` - When an internal note is added
- `lead.note.deleted` - When an internal note is deleted

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
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request data or stage transition
- `MISSING_REQUIRED_FIELD` - Required field missing (e.g., `contactName` or `transportType` for conversion)
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions

## Important Notes

- **Required fields for creating a lead:** `make`, `model`, and `year` are mandatory
- **Title field:** `title` is optional. If not provided, it will be auto-generated as "Incoming lead from {source}" or "Incoming lead from website" if source is not provided
- **Leads do NOT have a status field** - they only have `stage` and `isActive`
- **Default list/get endpoints only show active leads** (`isActive=true`) unless `?isActive=false` is explicitly requested
- Inactive leads remain in the system but are hidden from default views
- Converting lead to quote requires `contactName` and `transportType` fields
- When converted to quote, lead's `isActive` is set to `false` (lead becomes inactive)

