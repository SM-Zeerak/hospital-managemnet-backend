#!/bin/bash

# List Dispatch Change History
# GET /api/v1/tenant/dispatch/:dispatchId/change-history

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"

curl -X GET "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}/change-history?limit=50&offset=0&orderBy=timeStamp&orderDir=DESC" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

