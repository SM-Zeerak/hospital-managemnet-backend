#!/bin/bash

# Delete Guard
# DELETE /api/v1/guards/guards/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
guard_id="${GUARD_ID:-}"

if [ -z "$guard_id" ]; then
  echo "Usage: GUARD_ID=<uuid> ./delete.sh"
  echo "Or: export GUARD_ID=<uuid>; ./delete.sh"
  exit 1
fi

curl -s -X DELETE "${base_url}/guards/guards/${guard_id}" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -w "\n"
