#!/usr/bin/env bash

# Get current authenticated user profile

curl -X GET "${BASE_URL}/api/v1/superadmin/auth/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

