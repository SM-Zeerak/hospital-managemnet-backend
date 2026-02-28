# Guards Module - cURL Examples

This directory contains cURL examples for all Guard registration/record endpoints.

## Prerequisites

1. Set your base URL (include `/api/v1`):
   ```bash
   export base_url="http://localhost:4002/api/v1"
   ```

2. Get your authentication token (from login):
   ```bash
   export TENANT_API_TOKEN="your-access-token-here"
   ```

## Guard CRUD Operations

### Who can access guards module
```bash
./who-can-access.sh
```
**Endpoint:** `GET /api/v1/guards/guards/who-can-access`

Returns which roles have which guards permissions (`guards.read`, `guards.create`, `guards.update`, `guards.delete`). Requires `guards.read`.

**Response:**
```json
{
  "ok": true,
  "data": {
    "permissions": [
      { "key": "guards.read", "name": "View guards" },
      { "key": "guards.create", "name": "Create guards" },
      { "key": "guards.update", "name": "Update guards" },
      { "key": "guards.delete", "name": "Delete guards" }
    ],
    "roles": [
      { "id": "uuid", "name": "admin", "description": "System Administrator", "permissions": ["guards.read", "guards.create", "guards.update", "guards.delete"] }
    ]
  }
}
```

---

### List Guards
```bash
./list.sh
```
**Endpoint:** `GET /api/v1/guards/guards`

**Query Parameters (all optional):**
- `guardId` (string): Filter by guard ID (partial match)
- `name` (string): Filter by name (partial match)
- `cnic` (string): Filter by CNIC (partial match)
- `limit` (string): Number of results (default: 50)
- `offset` (string): Pagination offset (default: 0)
- `orderBy` (string): `createdAt` | `updatedAt` | `name` (default: `createdAt`)
- `orderDir` (string): `ASC` | `DESC` (default: `DESC`)

**Required Permissions:** `guards.read`

**Example with filters:**
```bash
curl -s -X GET "${base_url}/guards/guards?guardId=G001&name=Ali&cnic=35201&limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"
```

---

### Create Guard
```bash
./create.sh
```
**Endpoint:** `POST /api/v1/guards/guards`

**Required fields:** `guardId`, `name`, `cnic`. All other fields are optional.

**Request:** JSON body **or** multipart/form-data:
- **JSON:** Send `Content-Type: application/json` with guard object.
- **Multipart:** Send form field `data` (JSON string with guardId, name, cnic, ...), optional `image` (file), optional `document`/`documents` (files), and optional `documentDate`/`expireDate` (applied to uploaded documents for expiry alerts). Images and documents are uploaded to Cloudinary; `publicId` is stored for later delete via delete API.

| Field | Type | Description |
|-------|------|-------------|
| guardId | string | **Required.** Guard badge/registration ID |
| dateOfRegistration | string | Date (YYYY-MM-DD) |
| name | string | **Required** |
| fatherName | string | |
| dateOfBirth | string | Date (YYYY-MM-DD) |
| education | string | |
| cnic | string | **Required** |
| imageUrl / imageCloudinaryPublicId | string | Set automatically when uploading `image` in multipart |
| documents | array | `[{ url, publicId, resourceType?, documentDate?, expireDate?, name? }]` — set when uploading document(s); use documentDate/expireDate for expiry alerts |
| currentAddress | string | |
| permanentAddress | string | |
| contactNo1 | string | |
| contactNo2 | string | |
| salary | number | |
| policeDistrictCurrent | string | |
| policeDistrictPermanent | string | |
| sameAddress | boolean | |
| language | string | |
| married | boolean | |
| emergencyContact | object | { name, contactNo, address, cnic } |
| services | object | { type, unitNo, experienceYears } |
| questions | object | { workedAsGuard, companyName, reasonOfLeaving, apssaTrained, workAnywhere, armyCourtCase } |
| references | array | [{ name, address, cnic, contact, relation }] |

**Required Permissions:** `guards.create`

**Multipart example (image + document with expiry dates):**
```bash
# With image and document (set env or paths)
export IMAGE_FILE=/path/to/photo.jpg
export DOCUMENT_FILE=/path/to/license.pdf
export DOCUMENT_DATE=2025-01-01
export EXPIRE_DATE=2026-01-01
./create-multipart.sh
```
Or JSON only: `./create.sh`

---

### Get Guard by ID
```bash
GUARD_ID=<uuid> ./get.sh
```
**Endpoint:** `GET /api/v1/guards/guards/:id`

**Required Permissions:** `guards.read`

---

### Update Guard
```bash
GUARD_ID=<uuid> ./update.sh
```
**Endpoint:** `PATCH /api/v1/guards/guards/:id`

Send only the fields you want to update in the body. **Documents are not updated here** — use the separate document APIs below to add or update documents.

**Required Permissions:** `guards.update`

---

### Guard documents (add / update / delete)

Documents are managed separately from guard create/update. **When creating** a guard you can send documents in multipart. **When updating** a guard, do not send documents; use these APIs instead. Each document in `guard.documents` has a unique **`id`** (UUID) — use this to update or delete that specific document.

#### Add documents to a guard
```bash
GUARD_ID=<uuid> DOCUMENT_FILE=/path/to/file.pdf ./documents-add.sh
```
**Endpoint:** `POST /api/v1/guards/guards/:id/documents`

**Multipart:** `document` or `documents` (file(s)), optional `documentDate`, `expireDate`. Backend uploads to Cloudinary and appends to `guard.documents`.

**Required Permissions:** `guards.update`

#### Update document metadata
```bash
GUARD_ID=<uuid> DOCUMENT_ID=<doc_uuid> ./documents-update.sh
# or by Cloudinary publicId: PUBLIC_ID=guards/abc123 ./documents-update.sh
```
**Endpoint:** `PATCH /api/v1/guards/guards/:id/documents`

**Body (JSON):** Identify document by `id` (recommended; from `guard.documents[].id`) or `publicId`. Then optional `documentDate`, `expireDate`, `name`. Example: `{ "id": "550e8400-e29b-41d4-a716-446655440000", "expireDate": "2026-06-01" }`.

**Required Permissions:** `guards.update`

#### Remove document from guard
```bash
GUARD_ID=<uuid> DOCUMENT_ID=<doc_uuid> ./documents-delete.sh
# or: PUBLIC_ID=guards/abc123 ./documents-delete.sh
```
**Endpoint:** `DELETE /api/v1/guards/guards/:id/documents`

**Query or body:** `id` (document UUID, recommended) or `publicId` — removes that document and deletes from Cloudinary.

**Required Permissions:** `guards.update`

---

### Delete Guard
```bash
GUARD_ID=<uuid> ./delete.sh
```
**Endpoint:** `DELETE /api/v1/guards/guards/:id`

**Required Permissions:** `guards.delete`

---

## Response Examples

**List (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "guardId": "G001",
      "name": "Ali Khan",
      "fatherName": "Rashid Khan",
      "cnic": "35201-1234567-1",
      "imageUrl": "https://res.cloudinary.com/...",
      "imageCloudinaryPublicId": "guards/abc123",
      "documents": [{ "url": "https://res.cloudinary.com/...", "publicId": "guards/doc1", "documentDate": "2025-01-01", "expireDate": "2026-01-01", "name": "License" }],
      "contactNo1": "+92 300 1234567",
      "salary": "35000",
      "emergencyContact": { "name": "Sara", "contactNo": "+92 321 0000000" },
      "services": { "type": "civilian", "unitNo": "U1" },
      "questions": { "workedAsGuard": true },
      "references": [],
      "createdAt": "2025-01-28T00:00:00.000Z",
      "updatedAt": "2025-01-28T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Get by ID / Create / Update (200/201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "tenantId": "uuid",
    "guardId": "G001",
    "name": "Ali Khan",
    "fatherName": "Rashid Khan",
    "dateOfBirth": "1990-05-15",
    "cnic": "35201-1234567-1",
    "imageUrl": "https://res.cloudinary.com/...",
    "imageCloudinaryPublicId": "guards/abc123",
    "imageCloudinaryResourceType": "image",
    "documents": [{ "url": "https://res.cloudinary.com/...", "publicId": "guards/doc1", "resourceType": "raw", "documentDate": "2025-01-01", "expireDate": "2026-01-01", "name": "License" }],
    "currentAddress": "House 123, Lahore",
    "contactNo1": "+92 300 1234567",
    "salary": "35000",
    "emergencyContact": { "name": "Sara", "contactNo": "+92 321 0000000", "address": "Lahore", "cnic": "" },
    "services": { "type": "civilian", "unitNo": "U1", "experienceYears": "2" },
    "questions": { "workedAsGuard": true, "apssaTrained": true },
    "references": [{ "name": "Referee One", "relation": "Former employer" }],
    "createdAt": "2025-01-28T00:00:00.000Z",
    "updatedAt": "2025-01-28T00:00:00.000Z"
  }
}
```

**Delete (200):**
```json
{
  "ok": true,
  "data": { "id": "uuid" }
}
```
