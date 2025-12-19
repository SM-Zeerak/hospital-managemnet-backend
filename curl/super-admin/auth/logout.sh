#!/usr/bin/env bash

# Logout current session

curl -X POST "${BASE_URL}/api/v1/superadmin/auth/logout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

