#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 24.04 VPS for the oneKampus website.
#
#   ssh root@YOUR_SERVER_IP
#   curl -fsSL https://raw.githubusercontent.com/Ritiksharmaji/oneKampus-website/main/deploy/server-setup.sh -o setup.sh
#   bash setup.sh onekampus.com you@example.com
#
# Installs Node 22, PostgreSQL, Nginx, PM2, Certbot, a firewall and fail2ban; creates the `deploy`
# user, the database, /var/www/onekampus-website, the .env file, nightly backups and the key that
# GitHub Actions uses to deploy. Safe to run again: existing users, database, .env and keys are kept.
set -euo pipefail

DOMAIN="${1:?Usage: bash setup.sh <domain> <admin-email>   e.g. bash setup.sh onekampus.com you@gmail.com}"
ADMIN_EMAIL="${2:?Usage: bash setup.sh <domain> <admin-email>}"
DOMAIN="${DOMAIN#www.}"

APP_USER=deploy
APP_DIR=/var/www/onekampus-website
UPLOAD_DIR=/var/lib/onekampus/uploads
BACKUP_DIR=/var/backups/onekampus
DB_NAME=onekampus_website
DB_USER=onekampus
REPO_RAW=https://raw.githubusercontent.com/Ritiksharmaji/oneKampus-website/main

step() { printf '\n\033[1;38;5;209m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" -eq 0 ] || { echo "Run this as root (or with sudo)."; exit 1; }

step "Updating the system"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx postgresql ufw fail2ban unattended-upgrades certbot python3-certbot-nginx dnsutils

step "Installing Node.js 22 and PM2"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2@latest

step "Adding 2 GB swap (helps builds on small servers)"
if ! swapon --show | grep -q swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

step "Creating the '$APP_USER' user"
if ! id "$APP_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$APP_USER"
fi
install -d -m 700 -o "$APP_USER" -g "$APP_USER" "/home/$APP_USER/.ssh"
touch "/home/$APP_USER/.ssh/authorized_keys"
# Let the same keys that open root also open the deploy user.
if [ -f /root/.ssh/authorized_keys ]; then
  cat /root/.ssh/authorized_keys >> "/home/$APP_USER/.ssh/authorized_keys"
  sort -u -o "/home/$APP_USER/.ssh/authorized_keys" "/home/$APP_USER/.ssh/authorized_keys"
fi
chown "$APP_USER:$APP_USER" "/home/$APP_USER/.ssh/authorized_keys"
chmod 600 "/home/$APP_USER/.ssh/authorized_keys"

step "Creating folders"
install -d -o "$APP_USER" -g "$APP_USER" "$APP_DIR" "$APP_DIR/releases" "$APP_DIR/shared" "$UPLOAD_DIR" "$BACKUP_DIR"

step "Setting up PostgreSQL"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  sudo -u postgres psql -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';"
  echo "$DB_PASSWORD" > /root/.onekampus-db-password && chmod 600 /root/.onekampus-db-password
fi
DB_PASSWORD="$(cat /root/.onekampus-db-password)"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

step "Writing $APP_DIR/shared/.env"
ENV_FILE="$APP_DIR/shared/.env"
ADMIN_PASSWORD=""
if [ ! -f "$ENV_FILE" ]; then
  ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9' | head -c 16)"
  cat > "$ENV_FILE" <<EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
SITE_URL="https://$DOMAIN"
UPLOAD_DIR="$UPLOAD_DIR"

# First admin login, created by the first deploy
SEED_ADMIN_EMAIL="$ADMIN_EMAIL"
SEED_ADMIN_PASSWORD="$ADMIN_PASSWORD"

# Lead emails. Fill in SMTP to actually send (e.g. Gmail app password, Zoho, Resend).
LEADS_NOTIFY_EMAIL="$ADMIN_EMAIL"
MAIL_FROM="oneKampus <$ADMIN_EMAIL>"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
else
  echo "Keeping the existing .env"
fi

step "Configuring Nginx for $DOMAIN"
curl -fsSL "$REPO_RAW/deploy/nginx/onekampus-website.conf" -o /tmp/onekampus.conf
sed "s/__DOMAIN__/$DOMAIN/g" /tmp/onekampus.conf > /etc/nginx/sites-available/onekampus-website
ln -sf /etc/nginx/sites-available/onekampus-website /etc/nginx/sites-enabled/onekampus-website
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

step "Firewall: allow only SSH, HTTP and HTTPS"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
systemctl enable --now fail2ban

step "Automatic security updates"
dpkg-reconfigure -f noninteractive unattended-upgrades

step "Starting PM2 on boot for '$APP_USER'"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" >/dev/null

step "Nightly backups (database + uploads, kept 14 days)"
cat > /etc/cron.d/onekampus-backup <<EOF
# m h dom mon dow user command
30 2 * * * $APP_USER pg_dump "\$(grep ^DATABASE_URL $ENV_FILE | cut -d'"' -f2)" | gzip > $BACKUP_DIR/db-\$(date +\%F).sql.gz && tar -czf $BACKUP_DIR/uploads-\$(date +\%F).tar.gz -C $UPLOAD_DIR . && find $BACKUP_DIR -type f -mtime +14 -delete
EOF

step "Creating the GitHub Actions deploy key"
KEY="/home/$APP_USER/.ssh/github_actions"
if [ ! -f "$KEY" ]; then
  sudo -u "$APP_USER" ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f "$KEY" >/dev/null
  cat "$KEY.pub" >> "/home/$APP_USER/.ssh/authorized_keys"
fi

step "HTTPS certificate"
SERVER_IP="$(curl -fsS4 https://api.ipify.org || hostname -I | awk '{print $1}')"
DNS_IP="$(dig +short "$DOMAIN" A | tail -n1)"
if [ "$DNS_IP" = "$SERVER_IP" ]; then
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --redirect --agree-tos -m "$ADMIN_EMAIL" -n || \
    echo "Certbot failed — check that www.$DOMAIN also points to $SERVER_IP, then run: certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect"
else
  echo "$DOMAIN points to '${DNS_IP:-nothing}', not this server ($SERVER_IP)."
  echo "Add the DNS records, wait a few minutes, then run:"
  echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect --agree-tos -m $ADMIN_EMAIL"
fi

cat <<EOF


$(printf '\033[1;32m')Server is ready.$(printf '\033[0m')

1. Add these GitHub secrets (repo → Settings → Secrets and variables → Actions):
     VPS_HOST     $SERVER_IP
     VPS_USER     $APP_USER
     VPS_SSH_KEY  (everything printed between the lines below)
---------------------------------------------------------------------
$(cat "$KEY")
---------------------------------------------------------------------

2. Deploy: merge development into main (or run the "Deploy" workflow by hand).
EOF
if [ -n "$ADMIN_PASSWORD" ]; then
  cat <<EOF

3. Admin login after the first deploy: https://$DOMAIN/admin
     email     $ADMIN_EMAIL
     password  $ADMIN_PASSWORD
   (also stored in $ENV_FILE — change it in Admin → Users after signing in)
EOF
fi
