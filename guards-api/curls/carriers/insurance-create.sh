#!/usr/bin/env bash
# Create a new insurance policy for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./insurance-create.sh
curl -X POST "{{base_url}}/carriers/{{CARRIER_ID}}/insurance" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "policyNumber": "029177261-02",
    "insuranceCompany": "National Union Fire Ins CO",
    "expirationDate": "2024-11-11T00:00:00Z",
    "liabilityAmount": 100000.00,
    "cargoAmount": 500000.00,
    "documentName": "view.pdf",
    "status": "active"
  }'

