# oneKampus website

The public website for **oneKampus**. It shows every service — the software (Manage, Learn, Assess, Hire, the
mobile app, Sites), the **Kampus Store** (notebooks, uniforms, stationery, ID cards, bags, diaries) and services —
and turns visitors into leads through quote requests, demo bookings and contact forms. An admin panel lets the
team edit all content and work the leads without a developer.

One Next.js application: the pages (frontend) and the API/server actions (backend) live together.

| | |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript |
| Styling | Tailwind CSS 4 — same brand palette and fonts as the oneKampus platform |
| Database | PostgreSQL + Prisma 6 |
| Auth (admin) | Signed JWT cookie (jose) + bcrypt, roles Admin / Editor / Sales |
| Email | Nodemailer over SMTP (Zoho, Gmail, Resend…) — printed to the log when SMTP isn't set |
| Validation | Zod |

## Run it locally

Needs Node 20+ and PostgreSQL.

```bash
cp .env.example .env          # then fill in DATABASE_URL, AUTH_SECRET, SEED_ADMIN_*
createdb onekampus_website
npm install                   # also generates the Prisma client
npm run db:migrate            # create the tables
npm run db:seed               # sample catalogue + first admin user
npm run dev                   # http://localhost:3300
```

Admin panel: <http://localhost:3300/admin> — sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.

## What's where

| Path | What it is |
|---|---|
| `src/app/(site)/` | Public pages: home, `/solutions`, `/store`, `/services`, `/about`, `/contact`, `/book-demo`, `/partners`, `/quote`, `/privacy` |
| `src/app/admin/` | Admin panel: login, dashboard, leads, software, products, categories, services, testimonials, settings, users |
| `src/app/admin/actions/` | Server actions for the admin (all check the user's role) |
| `src/app/api/leads/route.ts` | `POST /api/leads` — every website form posts here |
| `src/app/media/[file]` | Serves uploaded product photos from `UPLOAD_DIR` |
| `src/lib/content.ts` | Cached reads for public pages (`"use cache"` + the `content` tag) |
| `src/lib/leads.ts` | Saves a lead and sends the team alert + customer confirmation emails |
| `src/proxy.ts` | Sends signed-out visitors of `/admin/*` to the login page |
| `prisma/schema.prisma` | Database tables · `prisma/seed.ts` sample content |

## How it works

**A visitor asks for a quote.** Product page → *Add to quote basket* (kept in the browser) → `/quote` → the form
posts to `/api/leads` → validated (Zod, honeypot, rate limit) → saved as a `Lead` with a reference like
`OKQ-26BX577T` → after the response, an email goes to `LEADS_NOTIFY_EMAIL` and a confirmation to the visitor.
Demo bookings (`OKD-…`), contact messages (`OKC-…`) and partner enquiries (`OKP-…`) follow the same path.

**The team works the lead.** Admin → Leads: filter, search, export CSV, open a lead, set its stage
(new → contacted → quoted → won/lost), assign it to a salesperson and add notes.

**An editor changes content.** Admin → Products/Software/… → Save. The save calls `updateTag("content")`, so the
public pages (prerendered and cached for an hour) refresh immediately.

**Roles.** Admin: everything, including users and deleting leads. Editor: website content. Sales: leads.

## Production

Live at **https://www.onekampus.com**, admin at **https://admin.onekampus.com** — AWS Lambda + CloudFront
(Mumbai) with Neon PostgreSQL, Cloudinary photos and Cloudflare Turnstile, deployed with SST.
Everything about hosting — architecture, setup from zero, secrets, domain, GitHub Actions, day-to-day
commands and troubleshooting — is in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## Branches

`main` is what runs on the server. Work happens on numbered branches made from `development`, which are merged
into `development`, and then `development` is merged into `main` to release (that deploys automatically).
Done so far: `01-setup-database`, `02-public-site`, `03-leads-and-forms`, `04-admin-panel`, `05-seo-and-launch`,
`06-photos-and-motion`, `07-deployment`, `08-aws-serverless`, `09-deployment-docs`.
