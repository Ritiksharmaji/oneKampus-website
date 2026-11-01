#!/usr/bin/env bash
# Copies the values from .env.aws into SST secrets (stored encrypted in AWS SSM) without printing them.
#   bash scripts/aws-secrets.sh [stage]      (default stage: production)
# Run it again whenever you change .env.aws, then redeploy.
set -euo pipefail
cd "$(dirname "$0")/.."
STAGE="${1:-production}"
[ -f .env.aws ] || { echo ".env.aws not found"; exit 1; }
set -a; . ./.env.aws; set +a

put() { # <SST secret name> <value>
  if [ -n "$2" ]; then
    npx sst secret set "$1" "$2" --stage "$STAGE" >/dev/null && echo "set   $1"
  else
    echo "empty $1 (skipped)"
  fi
}

put DatabaseUrl "${DATABASE_URL:-}"
put AuthSecret "${AUTH_SECRET:-}"
put CloudinaryCloudName "${CLOUDINARY_CLOUD_NAME:-}"
put CloudinaryApiKey "${CLOUDINARY_API_KEY:-}"
put CloudinaryApiSecret "${CLOUDINARY_API_SECRET:-}"
put TurnstileSiteKey "${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-}"
put TurnstileSecretKey "${TURNSTILE_SECRET_KEY:-}"
put SmtpPassword "${SMTP_PASSWORD:-}"
