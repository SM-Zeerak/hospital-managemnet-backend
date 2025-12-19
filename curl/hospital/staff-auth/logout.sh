#!/usr/bin/env bash

# Staff logout current session

curl -X POST "${BASE_URL}/api/v1/hospital/staff-auth/logout" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

