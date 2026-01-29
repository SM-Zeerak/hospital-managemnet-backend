# Carriers Module - cURL Examples

This directory contains cURL examples for all Carriers module endpoints.

## Prerequisites

1. Set your base URL:
   ```bash
   export base_url="http://localhost:4002"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Carrier Statistics

### Get Carrier Statistics
```bash
./stats.sh
```
**Endpoint:** `GET /api/v1/tenant/carriers/stats`

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
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "avgRatings": {
      "value": 4.5,
      "change": 2,
      "period": "Past month"
    },
    "totalPayouts": {
      "value": 125000.50,
      "change": -5,
      "period": "Past month"
    }
  }
}
```

**Note:** 
- The `change` field represents the percentage change from the previous month (30-60 days ago). Positive values indicate an increase, negative values indicate a decrease.
- `avgRatings` is calculated from the average of all carriers' `all_time_internal_rating` values.
- `totalPayouts` is the sum of all carriers' `this_year_tariff` values.

**Required Permissions:** `carriers.read`

## Carrier CRUD Operations

### List All Carriers
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/tenant/carriers`

**Query Parameters:**
- `search` (string, optional): Search term for name, main contact, email, or MC number
- `status` (enum, optional): `new` | `active` | `inactive` | `suspended` | `archived`
- `mcNumber` (string, optional): Filter by MC number
- `dateFrom` (ISO 8601, optional): Filter by creation date from
- `dateTo` (ISO 8601, optional): Filter by creation date to
- `limit` (number, optional): Number of results (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)
- `orderBy` (enum, optional): `name` | `status` | `mcNumber` | `createdAt` | `updatedAt` (default: `createdAt`)
- `orderDir` (enum, optional): `ASC` | `DESC` (default: `DESC`)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "name": "Test Carrier LLC",
      "status": "active",
      "mcNumber": "MC123456",
      "phone": "+1-555-0123",
      "mainContact": "John Doe",
      "contactEmail": "john@carrier.com",
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
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "avgRatings": {
      "value": 4.5,
      "change": 2,
      "period": "Past month"
    },
    "totalPayouts": {
      "value": 125000.50,
      "change": -5,
      "period": "Past month"
    }
  }
}
```

**Note:** The list endpoint now includes `stats` in the response, providing real-time statistics alongside the paginated carrier data.

### Create Carrier
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/carriers`

**Request Body:**
- `name` (required): Carrier name
- `status`: new, active, inactive, suspended, archived
- `yearEstablished`: Year the carrier was established
- `mcNumber`: MC number
- `phone`: Main phone number
- `fax`: Fax number
- `website`: Website URL
- `mainContact`: Main contact name
- `contactPhone`: Contact phone
- `contactEmail`: Contact email
- `dispatcher`: Dispatcher name
- `dispatchPhone`: Dispatch phone
- `dispatchEmail`: Dispatch email
- `billingContact`: Billing contact name
- `billingPhone`: Billing phone
- `billingEmail`: Billing email
- `hasWinch`: Boolean
- `hasTwic`: Boolean
- `motorcycles`: Boolean
- `cconDelivery`: Boolean
- `canDispatchFromForsee`: Boolean

### Get Carrier
```bash
export CARRIER_ID="<uuid>"
./get.sh
```
**Endpoint:** `GET /api/v1/tenant/carriers/:id`

**Response:**
```json
{
  "ok": true,
  "status": 200,
  "invokedMethod": "Get Carrier",
  "responseTime": 45.2,
  "timestamp": "2023-11-13T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "name": "Test Carrier LLC",
    "status": "active",
    "mcNumber": "MC123456",
    "phone": "+1-555-0123",
    "mainContact": "John Doe",
    "contactEmail": "john@carrier.com",
    "drivers": [...],
    "insurancePolicies": [...],
    "trailers": [...],
    "otherContacts": [...],
    "createdAt": "2023-10-01T00:00:00.000Z"
  },
  "stats": {
    "total": {
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "active": {
      "value": 16,
      "change": 5,
      "period": "Past month"
    },
    "avgRatings": {
      "value": 4.5,
      "change": 2,
      "period": "Past month"
    },
    "totalPayouts": {
      "value": 125000.50,
      "change": -5,
      "period": "Past month"
    }
  }
}
```

**Note:** The get endpoint now includes `stats` in the response, providing real-time statistics alongside the carrier data.

### Update Carrier
```bash
export CARRIER_ID="<uuid>"
./update.sh
```
**Endpoint:** `PATCH /api/v1/carriers/:id`

### Delete Carrier
```bash
export CARRIER_ID="<uuid>"
./delete.sh
```
**Endpoint:** `DELETE /api/v1/carriers/:id`

## Drivers Management

### List Drivers
```bash
export CARRIER_ID="<uuid>"
./drivers-list.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/drivers`

### Create Driver
```bash
export CARRIER_ID="<uuid>"
./drivers-create.sh
```
**Endpoint:** `POST /api/v1/carriers/:carrierId/drivers`

**Request Body:**
- `driverName` (required): Driver name
- `driverPhone`: Driver phone number
- `driverEmail`: Driver email
- `status`: active, inactive

### Get Driver
```bash
export CARRIER_ID="<uuid>"
export DRIVER_ID="<uuid>"
./drivers-get.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/drivers/:driverId`

### Update Driver
```bash
export CARRIER_ID="<uuid>"
export DRIVER_ID="<uuid>"
./drivers-update.sh
```
**Endpoint:** `PATCH /api/v1/carriers/:carrierId/drivers/:driverId`

### Delete Driver
```bash
export CARRIER_ID="<uuid>"
export DRIVER_ID="<uuid>"
./drivers-delete.sh
```
**Endpoint:** `DELETE /api/v1/carriers/:carrierId/drivers/:driverId`

## Insurance Management

### List Insurance Policies
```bash
export CARRIER_ID="<uuid>"
./insurance-list.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/insurance`

### Create Insurance Policy
```bash
export CARRIER_ID="<uuid>"
./insurance-create.sh
```
**Endpoint:** `POST /api/v1/carriers/:carrierId/insurance`

**Request Body:**
- `policyNumber` (required): Insurance policy number
- `insuranceCompany` (required): Insurance company name
- `expirationDate` (required): Expiration date (ISO 8601 format)
- `liabilityAmount`: Liability coverage amount
- `cargoAmount`: Cargo coverage amount
- `documentFileId`: UUID of uploaded document file
- `documentName`: Document file name
- `status`: active, expired, inactive

### Get Insurance Policy
```bash
export CARRIER_ID="<uuid>"
export INSURANCE_ID="<uuid>"
./insurance-get.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/insurance/:insuranceId`

### Update Insurance Policy
```bash
export CARRIER_ID="<uuid>"
export INSURANCE_ID="<uuid>"
./insurance-update.sh
```
**Endpoint:** `PATCH /api/v1/carriers/:carrierId/insurance/:insuranceId`

### Delete Insurance Policy
```bash
export CARRIER_ID="<uuid>"
export INSURANCE_ID="<uuid>"
./insurance-delete.sh
```
**Endpoint:** `DELETE /api/v1/carriers/:carrierId/insurance/:insuranceId`

## Trailers Management

### List Trailers
```bash
export CARRIER_ID="<uuid>"
./trailers-list.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/trailers`

### Create Trailer
```bash
export CARRIER_ID="<uuid>"
./trailers-create.sh
```
**Endpoint:** `POST /api/v1/carriers/:carrierId/trailers`

**Request Body:**
- `trailerType` (required): Type of trailer (e.g., "Flatbed", "Dry Van", "Refrigerated")
- `description`: Additional description
- `status`: active, inactive

### Get Trailer
```bash
export CARRIER_ID="<uuid>"
export TRAILER_ID="<uuid>"
./trailers-get.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/trailers/:trailerId`

### Update Trailer
```bash
export CARRIER_ID="<uuid>"
export TRAILER_ID="<uuid>"
./trailers-update.sh
```
**Endpoint:** `PATCH /api/v1/carriers/:carrierId/trailers/:trailerId`

### Delete Trailer
```bash
export CARRIER_ID="<uuid>"
export TRAILER_ID="<uuid>"
./trailers-delete.sh
```
**Endpoint:** `DELETE /api/v1/carriers/:carrierId/trailers/:trailerId`

## Other Contacts Management

### List Other Contacts
```bash
export CARRIER_ID="<uuid>"
./other-contacts-list.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/other-contacts`

### Create Other Contact
```bash
export CARRIER_ID="<uuid>"
./other-contacts-create.sh
```
**Endpoint:** `POST /api/v1/carriers/:carrierId/other-contacts`

**Request Body:**
- `contactName` (required): Contact name
- `contactPhone`: Contact phone number
- `contactEmail`: Contact email
- `contactType`: Type/category of contact (optional)
- `notes`: Additional notes
- `status`: active, inactive

### Get Other Contact
```bash
export CARRIER_ID="<uuid>"
export CONTACT_ID="<uuid>"
./other-contacts-get.sh
```
**Endpoint:** `GET /api/v1/carriers/:carrierId/other-contacts/:contactId`

### Update Other Contact
```bash
export CARRIER_ID="<uuid>"
export CONTACT_ID="<uuid>"
./other-contacts-update.sh
```
**Endpoint:** `PATCH /api/v1/carriers/:carrierId/other-contacts/:contactId`

### Delete Other Contact
```bash
export CARRIER_ID="<uuid>"
export CONTACT_ID="<uuid>"
./other-contacts-delete.sh
```
**Endpoint:** `DELETE /api/v1/carriers/:carrierId/other-contacts/:contactId`

## Complete Workflow Example

```bash
# 1. Login to get token
TOKEN=$(curl -X POST "http://localhost:4002/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"tenant.admin@freightezcrm.com","password":"ChangeMe123!"}' \
  | jq -r '.data.accessToken')

export TENANT_API_TOKEN=$TOKEN
export base_url="http://localhost:4002"

# 2. Create a carrier
CARRIER_ID=$(curl -X POST "$base_url/api/v1/carriers" \
  -H "Authorization: Bearer $TENANT_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Carrier LLC"}' \
  | jq -r '.data.id')

export CARRIER_ID=$CARRIER_ID

# 3. Add a driver
./drivers-create.sh

# 4. Add insurance
./insurance-create.sh

# 5. Add trailer
./trailers-create.sh

# 6. Add other contact
./other-contacts-create.sh

# 7. Get full carrier details
./get.sh
```

## Notes

- All endpoints require authentication via Bearer token
- All endpoints are protected with RBAC permissions (`carriers.read`, `carriers.create`, `carriers.update`, `carriers.delete`)
- Replace `{{base_url}}` with your actual API base URL (e.g., `http://localhost:4002`)
- UUIDs can be obtained from previous API responses
- Date fields should be in ISO 8601 format (e.g., `2024-11-11T00:00:00Z`)

