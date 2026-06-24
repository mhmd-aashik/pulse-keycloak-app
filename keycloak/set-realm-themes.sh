#!/usr/bin/env bash
set -euo pipefail

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASS="${KEYCLOAK_ADMIN_PASSWORD:-admin_pass}"
REALM="${KEYCLOAK_REALM:-pulse}"
THEME="${KEYCLOAK_THEME:-pulse}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install with: brew install jq" >&2
  exit 1
fi

echo "Fetching admin token..."
TOKEN="$(
  curl -sf -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${ADMIN_USER}" \
    -d "password=${ADMIN_PASS}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" \
    | jq -r '.access_token'
)"

if [[ -z "${TOKEN}" || "${TOKEN}" == "null" ]]; then
  echo "Failed to obtain Keycloak admin token." >&2
  exit 1
fi

echo "Updating realm '${REALM}' themes to '${THEME}'..."
REALM_JSON="$(
  curl -sf "${KEYCLOAK_URL}/admin/realms/${REALM}" \
    -H "Authorization: Bearer ${TOKEN}"
)"

UPDATED_JSON="$(
  echo "${REALM_JSON}" | jq \
    --arg theme "${THEME}" \
    '.loginTheme = $theme | .accountTheme = $theme | .emailTheme = $theme'
)"

curl -sf -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${UPDATED_JSON}" >/dev/null

echo "Done. loginTheme, accountTheme, and emailTheme are set to '${THEME}'."
