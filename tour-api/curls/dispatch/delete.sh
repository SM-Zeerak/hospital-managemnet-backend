#!/bin/bash

# Delete Dispatch
# DELETE /api/v1/tenant/dispatch/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"

curl -X DELETE "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

