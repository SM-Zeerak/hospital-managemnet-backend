#!/bin/bash

# Create Quote (Direct - without leadId)
# POST /api/v1/tenant/quotes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/quotes" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "transportType": "Enclosed",
    "shippingDate": "2025-12-24T19:00:00.000Z",
    "source": "Web",
    "customerPhone": "4709190737",
    "customerName": "Roxana Torres",
    "customerEmail": "roxana@example.com",
    "companyName": "Example Company",
    "customerAddress": "123 Main St",
    "customerCity": "Atlanta",
    "customerState": "GA",
    "customerPostalCode": "30301",
    "customerCountry": "USA",
    "originCity": "Shannon",
    "originState": "MS",
    "originPostalCode": "51503",
    "originCountry": "USA",
    "destinationCity": "Rockwall",
    "destinationState": "TX",
    "destinationPostalCode": "75087",
    "destinationCountry": "USA",
    "make": "Toyota",
    "model": "Corolla",
    "year": 2024,
    "assignedUser": "{{USER_ID}}",
    "assignedTeam": "Sales",
    "amount": 1500.00,
    "costAmount": 1200.00,
    "margin": 20.00,
    "notes": "Quote notes here"
  }' \
  -w "\n"

