#!/bin/bash

# Update Dispatch Internal Note
# PATCH /api/v1/tenant/dispatch/:dispatchId/internal-notes/:noteId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"
note_id="{{NOTE_ID}}"

curl -X PATCH "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}/internal-notes/{{NOTE_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Updated internal note"
  }' \
  -w "\n"

