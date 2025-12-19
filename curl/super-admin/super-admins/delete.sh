#!/usr/bin/env bash

# Delete super admin (requires super-admin role, cannot delete yourself)

curl -X DELETE "${BASE_URL}/api/v1/superadmin/super-admins/${SUPER_ADMIN_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

