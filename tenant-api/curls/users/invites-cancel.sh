#!/bin/bash

# Cancel User Invite
# POST /api/v1/tenant/users/invites/:inviteId/cancel

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
invite_id="${1:-00000000-0000-0000-0000-000000000000}"

curl -X POST "{{base_url}}/tenant/users/invites/{{INVITE_ID}}/cancel" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

