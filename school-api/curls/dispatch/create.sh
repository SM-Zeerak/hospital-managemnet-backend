#!/bin/bash

# Create Dispatch
# POST /api/v1/tenant/dispatch

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"

curl -X POST "{{base_url}}/tenant/dispatch" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{{ORDER_ID}}",
    "carrierId": "{{CARRIER_ID}}",
    "carrierName": "ABC Transport",
    "status": "unposted",
    "secondaryStatus": "Awaiting Carrier Confirmation",
    "customerName": "John Doe",
    "customerPhone": "4709190737",
    "customerEmail": "john@example.com",
    "vehicles": "2020 Toyota Camry",
    "origin": "Atlanta, GA 30301",
    "destination": "Dallas, TX 75201",
    "shipDate": "2025-12-15T00:00:00Z",
    "firstAvailablePickup": "2025-12-15T08:00:00Z",
    "transportType": "Open",
    "priceExpiration": "2025-12-20T00:00:00Z",
    "totalTariff": 1500.00,
    "carrierPay": 1200.00,
    "brokerFee": 300.00,
    "pickupDate": "2025-12-15T08:00:00Z",
    "pickupWindow": "8:00 AM - 12:00 PM",
    "deliveryDate": "2025-12-20T17:00:00Z",
    "deliveryWindow": "2:00 PM - 6:00 PM",
    "leadSource": "Leads Pro",
    "assignedTo": "{{USER_ID}}",
    "referralSource": "Referral",
    "primaryRep": "Sales Rep Name",
    "assignedTeam": "Dispatch Team",
    "notes": "Handle with care"
  }' \
  -w "\n"

