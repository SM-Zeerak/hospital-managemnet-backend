#!/bin/bash

# Delete Lead Internal Note
# DELETE /api/v1/tenant/leads/:leadId/internal-notes/:noteId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X DELETE "{{base_url}}/tenant/leads/{{LEAD_ID}}/internal-notes/{{NOTE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

