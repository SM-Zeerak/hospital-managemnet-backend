#!/bin/bash

# Create Lead
# POST /api/v1/tenant/leads

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/leads" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "leadNumber": "LEAD-12345",
    "source": "Rehan Afridi",
    "contactName": "John Doe",
    "contactEmail": "john@example.com",
    "contactPhone": "555-0123",
    "transportType": "Open",
    "originCity": "Shannon",
    "originState": "MS",
    "originZip": "51503",
    "originCountry": "USA",
    "destinationCity": "Rockwall",
    "destinationState": "TX",
    "destinationZip": "75087",
    "destinationCountry": "USA",
    "expectedShipDate": "2025-11-14T00:00:00Z",
    "totalTariff": 0,
    "totalCarrierPay": 0,
    "totalBrokerFee": 0,
    "assignedTo": null,
    "assignedTeam": null,
    "shipperNote": "",
    "priority": "normal"
  }' \
  -w "\n"
