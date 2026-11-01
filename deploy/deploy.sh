#!/usr/bin/env bash
# Deploys the oneKampus website on the server, as the `deploy` user:
#   bash deploy.sh [branch]          (GitHub Actions runs this on every push to main)
#
# Each deploy is built in its own folder under releases/. The live site keeps running from the
# previous release until the new one has built, migrated and answered a health check; if anything
# fails, the old release stays (or is put back) live. The last 3 releases are kept for rollback.
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="${APP_DIR:-/var/www/onekampus-website}"
REPO="${REPO:-https://github.com/Ritiksharmaji/oneKampus-website.git}"
APP_NAME=onekampus-website
export PORT="${PORT:-3300}"

RELEASE="$APP_DIR/releases/$(date +%Y%m%d-%H%M%S)"
PREVIOUS=""
[ -L "$APP_DIR/current" ] && PREVIOUS="$(readlink -f "$APP_DIR/current")"

step() { printf '\n==> %s\n' "$*"; }
start_release() {
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start "$1/ecosystem.config.cjs" >/dev/null
  pm2 save >/dev/null
}

SWITCHED=0
on_error() {
  if [ "$SWITCHED" -eq 0 ]; then
    echo "Deploy failed before going live — the site was not changed."
    rm -rf "$RELEASE"
  fi
}
trap on_error ERR

step "Fetching $BRANCH"
git clone --quiet --depth 1 --branch "$BRANCH" "$REPO" "$RELEASE"
ln -s "$APP_DIR/shared/.env" "$RELEASE/.env"
cd "$RELEASE"
echo "Commit: $(git log -1 --format='%h %s')"

step "Installing packages"
npm ci --include=dev --no-audit --no-fund

step "Updating the database"
npx prisma migrate deploy
if [ -z "$PREVIOUS" ]; then
  step "First deploy: adding the catalogue and the first admin"
  npm run db:seed
fi

step "Building"
npm run build

step "Switching to the new release"
SWITCHED=1
ln -sfn "$RELEASE" "$APP_DIR/current"
start_release "$RELEASE"

step "Health check"
app_online() {
  pm2 jlist | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const p=JSON.parse(s).find(a=>a.name===process.argv[1]);process.exit(p&&p.pm2_env.status==="online"&&p.pm2_env.restart_time===0?0:1)})' "$APP_NAME"
}
for i in $(seq 1 20); do
  if app_online && curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then
    echo "Live: $RELEASE"
    break
  fi
  if [ "$i" -eq 20 ]; then
    echo "The new release did not respond."
    if [ -n "$PREVIOUS" ]; then
      echo "Putting $PREVIOUS back live."
      ln -sfn "$PREVIOUS" "$APP_DIR/current"
      start_release "$PREVIOUS"
    fi
    exit 1
  fi
  sleep 2
done

step "Cleaning up old releases (keeping 3)"
ls -1dt "$APP_DIR"/releases/*/ | tail -n +4 | xargs -r rm -rf
echo "Done."
