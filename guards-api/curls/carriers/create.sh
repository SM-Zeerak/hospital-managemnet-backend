#!/usr/bin/env bash
# Create a new carrier (requires bearer token)
curl -X POST "{{base_url}}/carriers" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diesel Auto Express LLC",
    "status": "new",
    "yearEstablished": 2015,
    "mcNumber": "679452",
    "phone": "7543342323",
    "fax": "",
    "website": "https://dieselautoexpress.com",
    "mainContact": "Vlad Volovik",
    "contactPhone": "7543342323",
    "contactEmail": "dispatch@dieselautoexpress.com",
    "dispatcher": "Vlad Volovik",
    "dispatchPhone": "(360) 360-5355",
    "dispatchEmail": "",
    "billingContact": "",
    "billingPhone": "",
    "billingEmail": "",
    "hasWinch": false,
    "hasTwic": false,
    "motorcycles": false,
    "cconDelivery": false,
    "canDispatchFromForsee": false
  }'

