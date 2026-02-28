#!/bin/bash

# Update guard document metadata (documentDate, expireDate, name) by document id or publicId
# PATCH /api/v1/guards/guards/:id/documents
# Use DOCUMENT_ID (from guard.documents[].id) — recommended — or PUBLIC_ID (Cloudinary publicId)

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
guard_id="${GUARD_ID:-}"
document_id="${DOCUMENT_ID:-}"
public_id="${PUBLIC_ID:-}"

if [ -z "$guard_id" ]; then
  echo "Usage: GUARD_ID=<uuid> DOCUMENT_ID=<doc_uuid> ./documents-update.sh"
  echo "   or: GUARD_ID=<uuid> PUBLIC_ID=guards/abc123 ./documents-update.sh"
  exit 1
fi

if [ -n "$document_id" ]; then
  body="{\"id\": \"${document_id}\", \"documentDate\": \"2025-06-01\", \"expireDate\": \"2026-06-01\", \"name\": \"License renewed\"}"
elif [ -n "$public_id" ]; then
  body="{\"publicId\": \"${public_id}\", \"documentDate\": \"2025-06-01\", \"expireDate\": \"2026-06-01\", \"name\": \"License renewed\"}"
else
  echo "Set DOCUMENT_ID or PUBLIC_ID"
  exit 1
fi

curl -s -X PATCH "${base_url}/guards/guards/${guard_id}/documents" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d "${body}" \
  -w "\n"
