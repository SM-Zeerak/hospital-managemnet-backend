#!/bin/bash

# Create Order
# POST /api/v1/tenant/orders

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"

curl -X POST "{{base_url}}/tenant/orders" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "{{QUOTE_ID}}",
    "leadId": "{{LEAD_ID}}",
    "transportType": "Open",
    "firstAvailablePickup": "2025-12-15T00:00:00Z",
    "totalTariff": 1500.00,
    "carrierPay": 1200.00,
    "carrierPayTerms": "COD - Cash",
    "brokerFee": 300.00,
    "brokerFeeTerms": "Charge on Dispatch",
    "customerName": "John Doe",
    "customerPhone": "4709190737",
    "customerEmail": "john@example.com",
    "assignedTo": "{{USER_ID}}",
    "assignedTeam": "Sales",
    "originCity": "Atlanta",
    "originState": "GA",
    "originPostalCode": "30301",
    "originCountry": "USA",
    "originContactName": "Origin Contact",
    "originContactPhone": "404-555-1234",
    "destinationCity": "Dallas",
    "destinationState": "TX",
    "destinationPostalCode": "75201",
    "destinationCountry": "USA",
    "destinationContactName": "Destination Contact",
    "destinationContactPhone": "214-555-5678"
  }' \
  -w "\n"

