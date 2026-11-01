# oneKampus website — deployment guide

The complete record of how the website is hosted, how it was set up from zero, and how to run it day to day.

> **All keys, passwords, account IDs and connection strings in this file are made-up examples**
> (e.g. `123456789012`, `npg_EXAMPLE…`, `AKIAEXAMPLE…`). The real values live only in the private,
> git-ignored `.env.aws` on the developer's machine, in AWS (SSM Parameter Store) and in GitHub secrets.
> Never commit or paste real values.

---

## 1. What is live

| | |
|---|---|
| Website | **https://www.onekampus.com** |
| Admin panel | **https://admin.onekampus.com** (only there; `/admin` on the main domain shows "page not found") |
| Bare domain | `onekampus.com` → forwards (301) to `https://www.onekampus.com` |
| Hosting | AWS Lambda + CloudFront, region **ap-south-1 (Mumbai)**, deployed with **SST v4 + OpenNext 4** |
| Database | **Neon** PostgreSQL 17, free plan, AWS **ap-southeast-1 (Singapore)** |
| Uploaded product photos | **Cloudinary** (free plan) |
| Form spam protection | **Cloudflare Turnstile** (free) |
| Lead emails | **Gmail SMTP** with an app password |
| DNS | **GoDaddy** (domain registrar and DNS) |
| Code | **GitHub** `Ritiksharmaji/oneKampus-website` |
| Expected cost | about **₹0–50 / month** at showcase-site traffic (AWS free tiers + free plans) |

---

## 2. Architecture

```
                    ┌──────────────────────────── GoDaddy DNS ────────────────────────────┐
                    │ www   CNAME → dXXXXXXXXXXXXX.cloudfront.net                         │
                    │ admin CNAME → dXXXXXXXXXXXXX.cloudfront.net                         │
                    │ @     forwarding → https://www.onekampus.com (301)                  │
                    │ _xxxx CNAME → …acm-validations.aws   (certificate validation, keep) │
                    └─────────────────────────────────────────────────────────────────────┘
Visitor ──HTTPS──► CloudFront (CDN, certificate from ACM us-east-1)
                      │  CloudFront Function + KeyValueStore decide where each URL goes
                      ├── /_next/static/*, /images/*, /brand/*, … ──► S3 bucket (static files)
                      └── pages, /api/leads, admin, server actions ──► Lambda "server" (Node 22, arm64, Mumbai)
                                                                         │
                       ┌─────────────────────────────────────────────────┼───────────────────────────┐
                       │                                                 │                           │
              Neon PostgreSQL (Singapore)                 Cloudinary (photo uploads)      Gmail SMTP (lead emails)
              Prisma ORM, pooled connection               signed upload API               app password
                                                          
Next.js cache ("use cache" + updateTag) ──► OpenNext cache in S3 + DynamoDB tag table + SQS revalidation queue

GitHub: feature branch → development → main ──► Actions: type-check + lint → prisma migrate deploy → sst deploy
```

### AWS resources (all created by `sst.config.ts`)

| Resource | Purpose |
|---|---|
| CloudFront distribution | HTTPS, caching, `www` + `admin` hostnames |
| CloudFront Function + KeyValueStore | routes static files to S3, everything else to Lambda |
| S3 bucket | static assets (`_assets/`) and the Next.js page cache (`_cache/`) |
| Lambda **server** function | renders pages, handles forms, admin and server actions |
| Lambda **image optimizer** | Next.js image optimisation (unused today, created by default) |
| Lambda **revalidation** functions + SQS queue + DynamoDB table | refresh cached pages when the admin saves content |
| SSM parameters | app secrets (`sst secret set …`), encrypted |
| ACM certificate (**us-east-1**) | HTTPS for `onekampus.com`, `www.`, `admin.` — CloudFront requires us-east-1 |

### Code that matters for hosting

| File | What it does |
|---|---|
| `sst.config.ts` | AWS app: region, Lambda size, secrets → environment, domain + admin alias |
| `scripts/aws-secrets.sh` | copies values from `.env.aws` into SST secrets (SSM) without printing them |
| `src/proxy.ts` | admin only on `ADMIN_HOST`; `/admin` elsewhere is 404; login redirect |
| `src/lib/uploads.ts` | photo uploads to Cloudinary (local `./uploads` folder in development) |
| `src/lib/turnstile.ts`, `src/components/turnstile.tsx` | spam check on all lead forms |
| `prisma/schema.prisma` | `binaryTargets` includes `linux-arm64-openssl-3.0.x` for Lambda; `directUrl` for migrations |
| `.github/workflows/deploy.yml` | CI checks on every push; deploy when `main` changes |

---

## 3. Accounts and what each one holds

| Service | Used for | Where the values go |
|---|---|---|
| **AWS** | Lambda, CloudFront, S3, certificate | AWS CLI profile `onekampus` (Mac) · GitHub secrets (CI) |
| **Neon** | database | `.env.aws` → SSM (`DatabaseUrl`) · GitHub secret (`DIRECT_DATABASE_URL`) |
| **Cloudinary** | uploaded product photos | `.env.aws` → SSM |
| **Cloudflare** | Turnstile widget | `.env.aws` → SSM |
| **Google** | Gmail app password for SMTP | `.env.aws` → SSM |
| **GoDaddy** | domain + DNS | DNS records (below) |
| **GitHub** | code + Actions | repo secrets and variables (below) |

---

## 4. Setting it up from zero

Done once. Follow in order.

### 4.1 AWS account

1. Sign up at **aws.amazon.com** (card + phone verification).
2. **Billing → Budgets → Create budget** → monthly cost budget **$2**, email alerts. (Do this first.)
3. **IAM → Users → Create user** `onekampus-deploy` → **Attach policies directly → AdministratorAccess**
   (SST creates many kinds of resources).
4. Open the user → **Security credentials → Create access key → Command Line Interface**. Keep the key pair safe.
5. On the Mac (in your own terminal — never paste keys into chats or files in the repo):

```bash
brew install awscli
```

```bash
aws configure --profile onekampus
```

```
AWS Access Key ID:     AKIAEXAMPLE7EXAMPLE12
AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name:   ap-south-1
Default output format: json
```

Check it:

```bash
aws sts get-caller-identity --profile onekampus
```

```json
{ "Account": "123456789012", "Arn": "arn:aws:iam::123456789012:user/onekampus-deploy" }
```

### 4.2 Neon database

1. **neon.tech** → create project `onekampus-website`, region **AWS Asia Pacific 1 (Singapore)**, Postgres 17.
2. **Connect** → copy **two** strings (the "Connection pooling" switch changes between them):
   - pooling **on** (hostname contains `-pooler`) → `DATABASE_URL`
   - pooling **off** → `DIRECT_DATABASE_URL` (used for migrations)

```
DATABASE_URL="postgresql://neondb_owner:npg_EXAMPLEpassword@ep-example-123456-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_DATABASE_URL="postgresql://neondb_owner:npg_EXAMPLEpassword@ep-example-123456.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 4.3 Cloudinary

**cloudinary.com** → sign up → Dashboard shows the three values:

```
CLOUDINARY_CLOUD_NAME="dexample123"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="EXAMPLEaBcDeFgHiJkLmNoPqRsTu"
```

Uploads go to the folder `onekampus/products`.

### 4.4 Cloudflare Turnstile

**dash.cloudflare.com → Turnstile → Add widget** → hostnames `onekampus.com`, `www.onekampus.com`,
`localhost` → mode **Managed**:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAAEXAMPLEsiteKey"
TURNSTILE_SECRET_KEY="0x4AAAAAAAEXAMPLEsecretKeyEXAMPLE"
```

Without these two values the forms still work, just without the spam check.

### 4.5 Gmail app password

Google Account → turn on **2-Step Verification** → **Security → App passwords** → create "oneKampus":

```
SMTP_PASSWORD="abcd efgh ijkl mnop"
```

Without it, leads are still saved and shown in the admin, but no emails are sent.

### 4.6 The private settings file `.env.aws`

Lives in the project root, **git-ignored** (`.gitignore` has `.env*`), permissions `600`. Full example:

```bash
# Neon
DATABASE_URL="postgresql://neondb_owner:npg_EXAMPLEpassword@ep-example-123456-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_DATABASE_URL="postgresql://neondb_owner:npg_EXAMPLEpassword@ep-example-123456.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Cloudinary
CLOUDINARY_CLOUD_NAME="dexample123"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="EXAMPLEaBcDeFgHiJkLmNoPqRsTu"

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAAEXAMPLEsiteKey"
TURNSTILE_SECRET_KEY="0x4AAAAAAAEXAMPLEsecretKeyEXAMPLE"

# Domain
SITE_URL="https://www.onekampus.com"
ADMIN_HOST="admin.onekampus.com"
SITE_DOMAIN="www.onekampus.com"
CERT_ARN="arn:aws:acm:us-east-1:123456789012:certificate/11111111-2222-3333-4444-555555555555"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="you@gmail.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"
MAIL_FROM="oneKampus <you@gmail.com>"
LEADS_NOTIFY_EMAIL="you@gmail.com"

# Generated: openssl rand -base64 48  /  first admin login
AUTH_SECRET="EXAMPLE+long+random+string+of+64+characters+EXAMPLE+EXAMPLE+EXAMPLE"
SEED_ADMIN_EMAIL="you@gmail.com"
SEED_ADMIN_PASSWORD="ExamplePass2026"
```

`ADMIN_HOST` is a hostname only — no `https://`, no `www.`.

### 4.7 Create the database tables and first content

```bash
set -a && . ./.env.aws && set +a
```

```bash
DATABASE_URL="$DIRECT_DATABASE_URL" npx prisma migrate deploy
```

```bash
npx tsx prisma/seed.ts
```

The seed adds 6 software products, 6 store categories, 18 products with placeholder photos
(`public/images/products`), 5 services, site settings and the first admin (`SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`). It is safe to run again.

### 4.8 Store the secrets in AWS and deploy

```bash
npx sst install
```

```bash
bash scripts/aws-secrets.sh production
```

```
set   DatabaseUrl
set   AuthSecret
set   CloudinaryCloudName
…
empty SmtpPassword (skipped)
```

First deploy (no domain yet — gives a CloudFront address):

```bash
npx sst deploy --stage production
```

```
✓  Complete
   Web: https://dXXXXXXXXXXXXX.cloudfront.net
```

The first deploy takes 10–15 minutes (CloudFront). Right after any deploy, CloudFront's routing
table needs 1–2 minutes to reach every edge location — a 403/404 in that window is normal.

### 4.9 HTTPS certificate for the domain

```bash
aws acm request-certificate --profile onekampus --region us-east-1 \
  --domain-name onekampus.com \
  --subject-alternative-names www.onekampus.com admin.onekampus.com \
  --validation-method DNS
```

Get the validation records:

```bash
aws acm describe-certificate --profile onekampus --region us-east-1 \
  --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/11111111-2222-3333-4444-555555555555 \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord'
```

Add them in GoDaddy (**DNS → Add record → CNAME**). GoDaddy adds `.onekampus.com` itself, so the
**Name** is only the part before it:

| Type | Name | Value |
|---|---|---|
| CNAME | `_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d` | `_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c.example.acm-validations.aws` |
| CNAME | `_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.www` | `_8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b.example.acm-validations.aws` |
| CNAME | `_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.admin` | `_7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a.example.acm-validations.aws` |

**Keep these records forever** — AWS uses them to renew the certificate every year. Wait until it is issued:

```bash
aws acm wait certificate-validated --profile onekampus --region us-east-1 --certificate-arn <CERT_ARN>
```

### 4.10 Deploy with the domain

```bash
SITE_DOMAIN=www.onekampus.com ADMIN_HOST=admin.onekampus.com CERT_ARN=<CERT_ARN> npx sst deploy --stage production
```

> ⚠️ Always deploy with these three values set. A deploy without them removes the domain from CloudFront.
> GitHub Actions reads them from repository variables (section 6).

### 4.11 Point the domain at CloudFront (GoDaddy → DNS)

| Type | Name | Value | Notes |
|---|---|---|---|
| CNAME | `www` | `dXXXXXXXXXXXXX.cloudfront.net` | edit the existing `www` record |
| CNAME | `admin` | `dXXXXXXXXXXXXX.cloudfront.net` | new |
| Forwarding | `onekampus.com` | `https://www.onekampus.com` | Permanent (301), forward only, no masking |

GoDaddy cannot point the bare domain at CloudFront, hence the forwarding. Leave its `@` A record alone.

### 4.12 Check

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://www.onekampus.com/          # 200
curl -s -o /dev/null -w '%{http_code}\n' https://www.onekampus.com/admin     # 404
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://admin.onekampus.com/   # 307 …/admin
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://onekampus.com/        # 301 …www
```

Sign in at **https://admin.onekampus.com**, change the password in **Admin → Users**, edit a product
and check the change shows on the website immediately.

---

## 5. Day-to-day

### Deploy a change

The branch flow is `feature branch → development → main`. Merging into `main` deploys automatically
(once the GitHub secrets exist). From the Mac:

```bash
SITE_DOMAIN=www.onekampus.com ADMIN_HOST=admin.onekampus.com CERT_ARN=<CERT_ARN> npx sst deploy --stage production
```

### Change a secret (e.g. add the Gmail app password)

1. Edit `.env.aws`.
2. `bash scripts/aws-secrets.sh production`
3. Deploy (command above). Secrets reach the Lambda only on deploy.

### Database changes

1. Change `prisma/schema.prisma`, create the migration SQL locally (`npx prisma migrate diff …` or
   `npx prisma migrate dev`) and commit it.
2. On deploy, GitHub Actions runs `prisma migrate deploy` against Neon before `sst deploy`.
   From the Mac: `set -a && . ./.env.aws && set +a && DATABASE_URL="$DIRECT_DATABASE_URL" npx prisma migrate deploy`

### Content

Everything visible on the site — software, products, prices, photos, services, testimonials, contact
details, headline — is edited in the admin. Saving refreshes the public pages immediately.

### Logs

```bash
aws logs tail /aws/lambda/onekampus-website-production-WebServerApsouth1Function-xxxxxxxx --profile onekampus --since 1h --follow
```

(Find the exact name in AWS Console → CloudWatch → Log groups.)

### Backups

- Neon keeps a short restore history (window depends on the plan — Neon → Settings).
- Your own copy now and then:

```bash
set -a && . ./.env.aws && set +a && pg_dump "$DIRECT_DATABASE_URL" > onekampus-backup-$(date +%F).sql
```

- Uploaded photos are in Cloudinary; placeholder photos are in git.

### Costs

AWS Console → Billing. The $2 budget emails you before anything significant. Neon, Cloudinary and
Turnstile free plans show their usage in their dashboards.

### Remove everything

```bash
npx sst remove --stage production
```

Production is protected (`protect: true` in `sst.config.ts`); remove that line first. Data in Neon
and Cloudinary is separate and stays.

---

## 6. GitHub Actions (auto-deploy)

`.github/workflows/deploy.yml`:

| Trigger | Jobs |
|---|---|
| push / PR to any branch | **Type-check and lint** (`next typegen`, `tsc`, `eslint`) |
| push to `main` | + **Deploy to AWS**: `npm ci` → `prisma migrate deploy` → `sst deploy --stage production` |

GitHub → repo → **Settings → Secrets and variables → Actions**:

| Kind | Name | Example value |
|---|---|---|
| Secret | `AWS_ACCESS_KEY_ID` | `AKIAEXAMPLE7EXAMPLE12` |
| Secret | `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| Secret | `DIRECT_DATABASE_URL` | `postgresql://neondb_owner:npg_EXAMPLE…@ep-example-123456.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| Variable | `SITE_DOMAIN` | `www.onekampus.com` *(set)* |
| Variable | `ADMIN_HOST` | `admin.onekampus.com` *(set)* |
| Variable | `CERT_ARN` | `arn:aws:acm:us-east-1:123456789012:certificate/1111…` *(set)* |

Until `AWS_ACCESS_KEY_ID` exists, the deploy job prints a notice and skips.

---

## 7. Troubleshooting

| Symptom | Cause → fix |
|---|---|
| A page returns **403** on CloudFront but works on the Lambda URL | A folder in `public/` has the same name as a page route (we had `public/store` vs `/store`). CloudFront sends that prefix to S3. Keep public folders under names no page uses (photos are in `public/images/products`). |
| 403/404 for a minute right after deploying | CloudFront KeyValueStore still propagating. Wait 1–2 minutes. |
| The domain stopped working after a deploy | Deployed without `SITE_DOMAIN`/`ADMIN_HOST`/`CERT_ARN`. Redeploy with them. |
| First page view after a quiet period takes 2–3 s | Lambda cold start. Normal; `warm` in `sst.config.ts` can keep instances warm (costs a little). |
| `PrismaClientInitializationError … linux-arm64` | `binaryTargets` in `schema.prisma` must include `linux-arm64-openssl-3.0.x`; run `npx prisma generate` before deploying. |
| `/admin` shows "page not found" on www | Intended. Use https://admin.onekampus.com. |
| Admin login does nothing / logs out at once | Session cookies are secure and per host — use https and the `admin.` hostname. |
| Photo upload fails | Cloudinary values missing/wrong in SSM → fix `.env.aws`, run `scripts/aws-secrets.sh`, redeploy. |
| Forms say "complete the verification" | Turnstile hostnames must include the domain; check site/secret keys. |
| No lead emails | `SMTP_PASSWORD` empty or wrong (needs a Gmail **app** password, not the normal password). |
| Certificate stuck "Pending validation" | The `_…` CNAMEs in GoDaddy are missing or the Name includes `.onekampus.com` twice. |

---

## 8. Alternative: a single VPS

`deploy/README.md` and `deploy/*.sh` set the same app up on one Ubuntu server (Nginx, PM2, local
PostgreSQL, Let's Encrypt). Not used today; kept for when the oneKampus software products (LMS, IMS,
exams) need a server of their own.
