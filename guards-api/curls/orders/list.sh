#!/bin/bash

# List Orders with Filters and Pagination
# GET /api/v1/tenant/orders

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"

# Optional query parameters:
# - search: Search term for order number, customer name, reference, status notes
# - status: draft | awaiting_dispatch | scheduled | in_transit | delivered | cancelled
# - orderStatus: Order status string
# - secondaryStatus: Secondary status string
# - leadId: UUID of associated lead
# - quoteId: UUID of associated quote
# - assignedTo: UUID of assigned user
# - assignedDepartmentId: UUID of assigned user's department
# - assignedRoles: Comma-separated role names (e.g., "admin,sales")
# - transportType: Open | Enclosed | Driveaway | Other | DD | SDL | HS | SD | RGN | RGNE
# - dateFrom: Filter by creation date (ISO 8601)
# - dateTo: Filter by creation date (ISO 8601)
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt | orderCreated | pickupDate | deliveryDate | amount | status | orderNumber
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/orders?search={{SEARCH}}&status=awaiting_dispatch&limit=20&offset=0" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

