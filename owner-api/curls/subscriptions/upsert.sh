#!/usr/bin/env bash
# Upsert subscription for tenant
TENANT_ID="$1"
if [ -z "$TENANT_ID" ]; then
  echo "Usage: $0 <tenant-id>" >&2
  exit 1
fi

curl -X PUT "{{base_url}}/owner/subscriptions/${TENANT_ID}" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "11111111-2222-3333-4444-555555555555",
    "status": "active",
    "startAt": "2024-01-01T00:00:00Z",
    "nextBillingAt": "2024-02-01T00:00:00Z"
  }'
