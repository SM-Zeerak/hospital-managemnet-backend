#!/usr/bin/env bash
# Reset password with a valid reset token
curl -X POST "{{base_url}}/owner/auth/reset" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"${OWNER_RESET_TOKEN}\",
    \"password\": \"NewPassword123!\"
  }"


