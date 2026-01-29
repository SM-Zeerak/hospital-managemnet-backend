#!/bin/bash

# Update Dispatch
# PATCH /api/v1/tenant/dispatch/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"

curl -X PATCH "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "dispatched",
    "secondaryStatus": "Carrier Confirmed",
    "dispatchedAt": "2025-12-15T10:00:00Z",
    "carrierName": "Updated Carrier Name",
    "notes": "Updated dispatch notes"
  }' \
  -w "\n"

