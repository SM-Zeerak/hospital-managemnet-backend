#!/bin/bash

# List Lead Change History
# GET /api/v1/tenant/leads/:leadId/change-history

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X GET "{{base_url}}/tenant/leads/{{LEAD_ID}}/change-history?limit=50&offset=0&orderBy=timeStamp&orderDir=DESC" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

