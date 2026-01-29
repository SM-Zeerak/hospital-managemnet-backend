#!/bin/bash

# List Quotes with Filters and Pagination
# GET /api/v1/tenant/quotes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - search: Search term for quote number, customer name, phone, company name, notes
# - status: New | Sales Campaign | On Hold | Hot | Warm | Cold | VM | Email | Text | Red | Blue | Green | Yellow | Do not text | Booking Link Sent | Followup Campaign Set | Repeat Customer Campaign | Archived
# - quoteStatus: Quote status string (same as status options)
# - leadId: UUID of associated lead
# - assignedUser: UUID of assigned user
# - transportType: Open | Enclosed | Driveaway | Other | DD | SDL | HS | SD | RGN | RGNE
# - isActive: true | false (default: true - only shows active quotes unless explicitly set to false)
# - dateFrom: Filter by creation date (ISO 8601)
# - dateTo: Filter by creation date (ISO 8601)
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt | quoteCreated | shippingDate | amount | quoteNumber
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/quotes?search={{SEARCH}}&status=New&isActive=true&limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

