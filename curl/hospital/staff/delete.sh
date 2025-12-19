#!/usr/bin/env bash

# Delete staff (requires authentication and staff:delete permission or super-admin)

curl -X DELETE "${BASE_URL}/api/v1/hospital/staff/${STAFF_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

