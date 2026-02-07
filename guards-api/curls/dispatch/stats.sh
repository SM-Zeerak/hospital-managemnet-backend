#!/bin/bash

# Get Dispatch Statistics
# GET /api/v1/tenant/dispatch/stats

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"

curl -X GET "{{base_url}}/tenant/dispatch/stats" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

