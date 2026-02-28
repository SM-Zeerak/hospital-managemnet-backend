#!/bin/bash

# Update Guard (PATCH)
# PATCH /api/v1/guards/guards/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
guard_id="${GUARD_ID:-}"

if [ -z "$guard_id" ]; then
  echo "Usage: GUARD_ID=<uuid> ./update.sh"
  echo "Or: export GUARD_ID=<uuid>; ./update.sh"
  exit 1
fi

# Optional: include guardId, name, cnic if updating; documents array with documentDate/expireDate for expiry alerts
curl -s -X PATCH "${base_url}/guards/guards/${guard_id}" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ali Khan Updated",
    "contactNo1": "+92 300 9999999",
    "salary": 40000,
    "married": true
  }' \
  -w "\n"
