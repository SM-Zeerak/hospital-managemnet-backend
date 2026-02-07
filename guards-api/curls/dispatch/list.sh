#!/bin/bash

# List Dispatches with Filters and Pagination
# GET /api/v1/tenant/dispatch

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"

# Optional query parameters:
# - search: Search term for customer name, carrier name, origin, destination, notes
# - status: unposted | posted | dispatched | picked_up | in_transit | delivered | cancelled
# - secondaryStatus: Secondary status string
# - orderId: UUID of associated order
# - carrierId: UUID of associated carrier
# - assignedTo: UUID of assigned user
# - assignedDepartmentId: UUID of assigned user's department
# - assignedRoles: Comma-separated role names (e.g., "admin,dispatch")
# - transportType: Open | Enclosed | Driveaway | Other | DD | SDL | HS | SD | RGN | RGNE
# - dateFrom: Filter by creation date (ISO 8601)
# - dateTo: Filter by creation date (ISO 8601)
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt | status | pickupDate | deliveryDate | dispatchedAt | pickedUpAt | deliveredAt
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/dispatch?search={{SEARCH}}&status=dispatched&limit=20&offset=0" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

