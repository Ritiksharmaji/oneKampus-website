# Running the oneKampus website on AWS (Lambda + CloudFront)

The live setup. About ₹0–50 a month at showcase-site traffic. (`deploy/README.md` describes the
alternative: a single VPS.)

```
Visitor ──► www.yourdomain.com ──► CloudFront (CDN)
                                     ├── static files, photos ──► S3
                                     └── pages, forms, admin ──► Lambda (Mumbai, arm64)
admin.yourdomain.com ──► same app — serves only the admin; /admin on the main domain is "not found"
                                                   │
          Neon PostgreSQL (Singapore, free) ◄──────┤
          Cloudinary (uploaded product photos) ◄───┤
          Cloudflare Turnstile (form spam check) ◄─┤
          Gmail SMTP (lead emails) ◄───────────────┘
GitHub: merge development → main ──► Actions: check → migrate database → sst deploy
```

| Piece | Where it is configured |
|---|---|
| AWS resources (Lambda, CloudFront, S3, cache table/queue) | `sst.config.ts` |
| App secrets (database, auth, Cloudinary, Turnstile, SMTP) | AWS SSM, set from `.env.aws` by `scripts/aws-secrets.sh` |
| Admin on its own subdomain | `ADMIN_HOST` → `src/proxy.ts` |
| Auto-deploy | `.github/workflows/deploy.yml` |

## Deploy from your Mac

Needs the `onekampus` AWS CLI profile (`aws configure --profile onekampus`, region `ap-south-1`).

```bash
bash scripts/aws-secrets.sh production
```

```bash
npx sst deploy --stage production
```

The first command copies `.env.aws` into AWS (run it again after changing `.env.aws`). The second
builds and deploys, then prints the site URL. Database changes are applied with:

```bash
set -a && . ./.env.aws && set +a && DATABASE_URL="$DIRECT_DATABASE_URL" npx prisma migrate deploy
```

## Auto-deploy from GitHub

GitHub → **Settings → Secrets and variables → Actions**:

| Kind | Name | Value |
|---|---|---|
| Secret | `AWS_ACCESS_KEY_ID` | the `onekampus-deploy` access key ID |
| Secret | `AWS_SECRET_ACCESS_KEY` | its secret access key |
| Secret | `DIRECT_DATABASE_URL` | the Neon **direct** connection string (from `.env.aws`) |
| Variable | `SITE_DOMAIN` | e.g. `www.onekampus.com` (after the domain step) |
| Variable | `ADMIN_HOST` | e.g. `admin.onekampus.com` (after the domain step) |
| Variable | `CERT_ARN` | the certificate ARN (after the domain step) |

Then every merge of `development` into `main` deploys. Until the secrets exist, the deploy job is skipped.

## Your domain (GoDaddy)

1. A certificate is requested in AWS Certificate Manager (**us-east-1**, required by CloudFront) for
   `yourdomain.com`, `www.yourdomain.com` and `admin.yourdomain.com`.
2. In GoDaddy DNS add the **CNAME** records AWS gives for validation (names look like `_abc123…`). It
   turns *Issued* within minutes to an hour.
3. Deploy with `SITE_DOMAIN`, `ADMIN_HOST` and `CERT_ARN` set (locally as environment variables, in
   GitHub as repo variables).
4. In GoDaddy add **CNAME** `www` → the CloudFront address (`dxxxx.cloudfront.net`) and **CNAME**
   `admin` → the same address.
5. GoDaddy can't point the bare `yourdomain.com` at CloudFront, so use **Forwarding** (Domain →
   Forwarding → add `https://www.yourdomain.com`, permanent 301).

## Everyday

| What | How |
|---|---|
| Logs | AWS Console → CloudWatch → Log groups → `/aws/lambda/onekampus-website-production-WebServer…` |
| Change a secret | edit `.env.aws` → `bash scripts/aws-secrets.sh` → `npx sst deploy --stage production` |
| Costs | AWS Console → Billing; the $2 budget alert emails you |
| Database backups | Neon keeps a short restore history (check your plan's window in Neon → Settings); for your own copy run `pg_dump "$DIRECT_DATABASE_URL" > backup.sql` now and then |
| Remove everything | `npx sst remove --stage production` (production is protected; remove `protect` in `sst.config.ts` first) |
