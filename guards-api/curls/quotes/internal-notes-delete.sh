#!/bin/bash

# Delete Quote Internal Note
# DELETE /api/v1/tenant/quotes/:quoteId/internal-notes/:noteId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X DELETE "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/internal-notes/{{NOTE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

