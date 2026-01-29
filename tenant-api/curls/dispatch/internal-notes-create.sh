#!/bin/bash

# Create Dispatch Internal Note
# POST /api/v1/tenant/dispatch/:dispatchId/internal-notes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"

curl -X POST "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}/internal-notes" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Internal note about this dispatch"
  }' \
  -w "\n"

