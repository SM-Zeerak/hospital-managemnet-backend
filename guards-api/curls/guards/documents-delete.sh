#!/bin/bash

# Remove a document from a guard by document id or publicId (also deletes from Cloudinary)
# DELETE /api/v1/guards/guards/:id/documents
# Use DOCUMENT_ID (from guard.documents[].id) — recommended — or PUBLIC_ID

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
guard_id="${GUARD_ID:-}"
document_id="${DOCUMENT_ID:-}"
public_id="${PUBLIC_ID:-}"

if [ -z "$guard_id" ]; then
  echo "Usage: GUARD_ID=<uuid> DOCUMENT_ID=<doc_uuid> ./documents-delete.sh"
  echo "   or: GUARD_ID=<uuid> PUBLIC_ID=guards/abc123 ./documents-delete.sh"
  exit 1
fi

if [ -n "$document_id" ]; then
  curl -s -X DELETE "${base_url}/guards/guards/${guard_id}/documents?id=${document_id}" \
    -H "Authorization: Bearer ${token}" \
    -w "\n"
elif [ -n "$public_id" ]; then
  curl -s -X DELETE "${base_url}/guards/guards/${guard_id}/documents?publicId=${public_id}" \
    -H "Authorization: Bearer ${token}" \
    -w "\n"
else
  echo "Set DOCUMENT_ID or PUBLIC_ID"
  exit 1
fi
