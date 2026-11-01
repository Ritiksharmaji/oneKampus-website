# Putting the oneKampus website live on a VPS

About 30–45 minutes the first time. After that, every merge into `main` deploys by itself.

```
Visitor → your domain (GoDaddy DNS) → VPS (Hostinger, Ubuntu)
                                        ├─ Nginx + free HTTPS (Let's Encrypt)
                                        ├─ Next.js app on port 3300 (PM2 keeps it running)
                                        └─ PostgreSQL (private, not open to the internet)
GitHub: merge development → main → GitHub Actions checks the code → deploys to the VPS
```

| File | What it does |
|---|---|
| `server-setup.sh` | Run once on a fresh server: installs everything, creates the database, `.env`, firewall, backups and the deploy key |
| `deploy.sh` | Builds a new release next to the live one and switches over only if it starts correctly |
| `nginx/onekampus-website.conf` | Sends your domain to the app; Certbot adds HTTPS to it |
| `../.github/workflows/deploy.yml` | Checks every push; deploys when `main` changes |

---

## 1. Buy the VPS (Hostinger)

1. Go to **hostinger.in → VPS Hosting** and choose **KVM 2** (2 vCPU, 8 GB RAM) — enough for this website
   and later Orbitly and site-platform too.
2. Choose the period (12 months is a good balance of price and commitment) and pay.
3. In the setup screens choose:
   - **Location:** India (Mumbai)
   - **Operating system:** plain **Ubuntu 24.04** (not a panel or app template)
   - **Root password:** a long one — save it in a password manager.
   - **SSH key:** optional. Add yours if you have one (`cat ~/.ssh/id_ed25519.pub` on your Mac).
4. When it says *Running*, copy the server's **IP address** from the VPS overview page.

Test the login from your Mac's terminal (type `yes` the first time, then the root password):

```bash
ssh root@YOUR_SERVER_IP
```

## 2. Point your GoDaddy domain at the server

GoDaddy → **My Products** → your domain → **DNS** → **Manage DNS**:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | YOUR_SERVER_IP | 600 seconds |
| A | `www` | YOUR_SERVER_IP | 600 seconds |

- If there is already an `A` record for `@` (often "Parked"), **edit** it instead of adding a second one.
- If `www` exists as a **CNAME**, delete it before adding the `A` record.
- Leave the `MX` records alone if you use email on this domain.

Changes usually work within 5–30 minutes. Check from your Mac:

```bash
dig +short yourdomain.com
```

It should print your server IP.

## 3. Set up the server (one command)

Logged in as root on the server:

```bash
curl -fsSL https://raw.githubusercontent.com/Ritiksharmaji/oneKampus-website/main/deploy/server-setup.sh -o setup.sh
```

```bash
bash setup.sh yourdomain.com ritiksharma555598@gmail.com
```

It takes about 5 minutes and ends by printing:
- the three **GitHub secrets** (server IP, user, and a private deploy key),
- your **admin login** for the website.

Copy that output somewhere safe. If the domain wasn't pointing at the server yet, it also prints the
`certbot` command to run later for HTTPS.

## 4. Add the GitHub secrets

GitHub → **Ritiksharmaji/oneKampus-website** → **Settings** → **Secrets and variables** → **Actions** →
**New repository secret**, three times:

| Name | Value |
|---|---|
| `VPS_HOST` | the server IP |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | the whole private key, from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----` |

## 5. Deploy

Merge `development` into `main` (or GitHub → **Actions** → **Deploy** → **Run workflow** on `main`).
Watch it in the **Actions** tab: *Type-check and lint*, then *Deploy to VPS*. The first deploy also
loads the catalogue and creates the admin user.

Open `https://yourdomain.com` and `https://yourdomain.com/admin`, sign in with the printed login, and
change the password in **Admin → Users**.

## 6. Send real emails (optional, recommended)

Lead alerts only reach your inbox once SMTP is set. With Gmail: turn on 2-step verification, create an
**App password** (Google Account → Security → App passwords), then on the server:

```bash
nano /var/www/onekampus-website/shared/.env
```

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="ritiksharma555598@gmail.com"
SMTP_PASSWORD="the 16-letter app password"
```

Then restart the site:

```bash
sudo -u deploy pm2 restart onekampus-website
```

---

## Everyday commands (on the server)

| What | Command |
|---|---|
| Is the site running? | `sudo -u deploy pm2 status` |
| Live logs | `sudo -u deploy pm2 logs onekampus-website` |
| Deploy by hand | `sudo -u deploy bash /var/www/onekampus-website/current/deploy/deploy.sh main` |
| Roll back to the previous release | `ls /var/www/onekampus-website/releases`, then `sudo -u deploy ln -sfn /var/www/onekampus-website/releases/OLDER /var/www/onekampus-website/current && sudo -u deploy pm2 delete onekampus-website && sudo -u deploy pm2 start /var/www/onekampus-website/current/ecosystem.config.cjs` |
| Backups | `/var/backups/onekampus` — database and uploads every night at 2:30, kept 14 days |
| Restore a database backup | `gunzip -c /var/backups/onekampus/db-DATE.sql.gz \| sudo -u postgres psql onekampus_website` |
| Renew HTTPS | automatic (Certbot timer); test with `certbot renew --dry-run` |

Download backups to your Mac now and then — a backup on the same server doesn't help if the server is lost:

```bash
scp -r root@YOUR_SERVER_IP:/var/backups/onekampus ~/onekampus-backups
```

## Adding Orbitly and site-platform later

Same server: give each its own port, database and Nginx file (copy `nginx/onekampus-website.conf`,
change `server_name` to e.g. `lms.yourdomain.com` and the port), add an `A` record for the subdomain in
GoDaddy, then run `certbot --nginx -d lms.yourdomain.com`.
