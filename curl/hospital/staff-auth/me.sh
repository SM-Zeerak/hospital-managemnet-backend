#!/usr/bin/env bash

# Get current authenticated staff profile

curl -X GET "${BASE_URL}/api/v1/hospital/staff-auth/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

