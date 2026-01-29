#!/usr/bin/env bash
# List tenants (requires bearer token)
curl -X GET "{{base_url}}/owner/tenants" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json"
