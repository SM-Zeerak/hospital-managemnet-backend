#!/bin/bash

# List Leads with Filters and Pagination
# GET /api/v1/tenant/leads

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - search: Search term for title, lead number, company name, contact name, email, phone
# - stage: new | contacted | quoted | order | dispatch | delivered | closed | lost
# - isActive: true | false (default: true - only shows active leads unless explicitly set to false)
# - priority: low | normal | high
# - assignedTo: UUID of assigned user
# - transportType: Open | Enclosed | Driveaway | Other | DD | SDL | HS | SD | RGN | RGNE
# - dateFrom: Filter by creation date (ISO 8601)
# - dateTo: Filter by creation date (ISO 8601)
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt | expectedShipDate | expectedDeliveryDate | amount | priority | leadNumber
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/leads?search=test&stage=new&isActive=true&limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

