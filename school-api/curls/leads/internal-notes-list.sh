#!/bin/bash

# List Lead Internal Notes
# GET /api/v1/tenant/leads/:leadId/internal-notes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X GET "{{base_url}}/tenant/leads/{{LEAD_ID}}/internal-notes?limit=50&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

