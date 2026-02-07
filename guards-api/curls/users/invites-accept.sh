#!/bin/bash

# Accept User Invite (Public Endpoint)
# POST /api/v1/tenant/users/invites/accept

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${1:-00000000-0000-0000-0000-000000000000}"

curl -X POST "{{base_url}}/tenant/users/invites/accept" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"${TENANT_API_TOKEN}\",
    \"password\": \"SecurePassword123!\"
  }"

