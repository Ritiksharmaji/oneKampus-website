/// <reference path="./.sst/platform/config.d.ts" />

// AWS hosting: Next.js on Lambda behind CloudFront (Mumbai), built with OpenNext.
// Secrets live in AWS SSM via `npx sst secret set <Name> <value> --stage <stage>` (see DEPLOYMENT.md).
//   npx sst deploy --stage production
export default $config({
  app(input) {
    return {
      name: "onekampus-website",
      home: "aws",
      // Keep production data/resources if the app is ever removed; test stages clean up fully.
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      providers: {
        aws: {
          region: "ap-south-1",
          // Locally use the `onekampus` AWS CLI profile; GitHub Actions passes keys as env vars.
          ...(process.env.GITHUB_ACTIONS ? {} : { profile: "onekampus" }),
        },
      },
    };
  },

  async run() {
    const secret = (name: string) => new sst.Secret(name);
    const optional = (name: string) => new sst.Secret(name, "");

    const databaseUrl = secret("DatabaseUrl");
    const authSecret = secret("AuthSecret");
    const cloudinaryCloudName = optional("CloudinaryCloudName");
    const cloudinaryApiKey = optional("CloudinaryApiKey");
    const cloudinaryApiSecret = optional("CloudinaryApiSecret");
    const turnstileSiteKey = optional("TurnstileSiteKey");
    const turnstileSecretKey = optional("TurnstileSecretKey");
    const smtpPassword = optional("SmtpPassword");

    // Custom domain once the ACM certificate (us-east-1) is validated in GoDaddy DNS.
    const domainName = process.env.SITE_DOMAIN; // e.g. www.onekampus.com
    const adminHost = process.env.ADMIN_HOST ?? ""; // e.g. admin.onekampus.com
    const certArn = process.env.CERT_ARN;

    const site = new sst.aws.Nextjs("Web", {
      openNextVersion: "4.1.14",
      server: { architecture: "arm64", memory: "1536 MB", runtime: "nodejs22.x", timeout: "20 seconds" },
      ...(domainName && certArn
        ? { domain: { name: domainName, dns: false, cert: certArn, aliases: adminHost ? [adminHost] : [] } }
        : {}),
      environment: {
        DATABASE_URL: databaseUrl.value,
        AUTH_SECRET: authSecret.value,
        SITE_URL: domainName ? `https://${domainName}` : (process.env.SITE_URL ?? ""),
        ADMIN_HOST: adminHost,
        CLOUDINARY_CLOUD_NAME: cloudinaryCloudName.value,
        CLOUDINARY_API_KEY: cloudinaryApiKey.value,
        CLOUDINARY_API_SECRET: cloudinaryApiSecret.value,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: turnstileSiteKey.value,
        TURNSTILE_SECRET_KEY: turnstileSecretKey.value,
        SMTP_HOST: "smtp.gmail.com",
        SMTP_PORT: "587",
        SMTP_USER: process.env.SMTP_USER ?? "ritiksharma555598@gmail.com",
        SMTP_PASSWORD: smtpPassword.value,
        MAIL_FROM: process.env.MAIL_FROM ?? "oneKampus <ritiksharma555598@gmail.com>",
        LEADS_NOTIFY_EMAIL: process.env.LEADS_NOTIFY_EMAIL ?? "ritiksharma555598@gmail.com",
      },
    });

    return { url: site.url };
  },
});
