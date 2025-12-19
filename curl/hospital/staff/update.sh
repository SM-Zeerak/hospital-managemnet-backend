#!/usr/bin/env bash

# Update staff details (requires authentication and staff:update permission or super-admin)

curl -X PUT "${BASE_URL}/api/v1/hospital/staff/${STAFF_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated First Name",
    "lastName": "Updated Last Name",
    "phone": "+1234567890",
    "department": "Neurology",
    "position": "Head Doctor",
    "role": "doctor",
    "isActive": true,
    "permissions": [
      "patient:view",
      "patient:update",
      "appointment:create",
      "appointment:view",
      "medical_record:create",
      "medical_record:view",
      "medical_record:update"
    ]
  }'

