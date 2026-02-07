#!/bin/bash

# Get Quote Statistics
# GET /api/v1/tenant/quotes/stats

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X GET "{{base_url}}/tenant/quotes/stats" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

