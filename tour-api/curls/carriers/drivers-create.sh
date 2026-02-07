#!/usr/bin/env bash
# Create a new driver for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./drivers-create.sh
curl -X POST "{{base_url}}/carriers/{{CARRIER_ID}}/drivers" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "driverName": "Ian",
    "driverPhone": "564-888-4062",
    "driverEmail": "ian@example.com",
    "status": "active"
  }'

