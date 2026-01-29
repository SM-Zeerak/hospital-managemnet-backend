#!/bin/bash

# List Order Change History
# GET /api/v1/tenant/orders/:orderId/change-history

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

# Optional query parameters:
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: timeStamp | actionType
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/orders/{{ORDER_ID}}/change-history?limit=50&offset=0" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

