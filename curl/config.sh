#!/usr/bin/env bash

# Configuration file for curl scripts
# Source this file before running any curl scripts:
#   source curl/config.sh

# Base URL for the API
export BASE_URL="http://localhost:4000"

# Authentication tokens (set these after login)
export ACCESS_TOKEN=""
export REFRESH_TOKEN=""

# Super Admin ID (set this after creating a super admin)
export SUPER_ADMIN_ID=""

# Staff ID (set this after creating a staff member)
export STAFF_ID=""

# Password reset token (set this after requesting password reset)
export RESET_TOKEN=""

# Example usage:
# 1. source curl/config.sh
# 2. Run login.sh to get tokens
# 3. Set ACCESS_TOKEN and REFRESH_TOKEN from login response
# 4. Run other scripts

