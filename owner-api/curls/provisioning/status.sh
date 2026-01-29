#!/usr/bin/env bash
# Check provisioning status (super-admin token required)
curl -X GET "{{base_url}}/owner/provisioning/status?tenantId=${1}" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json"
