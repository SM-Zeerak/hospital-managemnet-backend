#!/usr/bin/env bash

# Get staff by ID (requires authentication and staff:view permission or super-admin)

curl -X GET "${BASE_URL}/api/v1/hospital/staff/${STAFF_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

