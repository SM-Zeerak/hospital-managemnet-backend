#!/usr/bin/env bash

# List all staff with pagination and filters (requires authentication and staff:list permission or super-admin)

curl -X GET "${BASE_URL}/api/v1/hospital/staff?page=1&limit=20&role=doctor&department=Cardiology&isActive=true&search=john" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

