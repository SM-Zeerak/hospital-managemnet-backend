#!/usr/bin/env bash
TENANT_ID="$1"
if [ -z "$TENANT_ID" ]; then
  echo "Usage: $0 <tenant-id>" >&2
  exit 1
fi

curl -X POST "{{base_url}}/owner/tenants/${TENANT_ID}/notify-sync" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json"
