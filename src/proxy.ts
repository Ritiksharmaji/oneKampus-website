import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// When ADMIN_HOST is set (e.g. admin.onekampus.com), the admin panel exists only on that host:
//   - on the public domain every /admin URL is "not found", so visitors never see a login page;
//   - on the admin host only the admin (and the files it needs) is served, the rest redirects to the website.
// Without ADMIN_HOST (local development) the admin is at /admin as usual.
const ADMIN_HOST = process.env.ADMIN_HOST?.toLowerCase();
const ADMIN_HOST_ALLOWS = /^\/(admin(\/|$)|_next\/|brand\/|images\/|media\/|icon\.svg$)/;

function requestHost(request: NextRequest) {
  // Behind CloudFront the original host arrives in x-forwarded-host.
  return (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
}

function absolute(request: NextRequest, path: string) {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0] ?? request.nextUrl.protocol.replace(":", "");
  return new URL(path, `${proto}://${request.headers.get("x-forwarded-host") ?? request.headers.get("host")}`);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (ADMIN_HOST) {
    const onAdminHost = requestHost(request) === ADMIN_HOST;
    if (!onAdminHost && isAdminPath) {
      // Rendered by app/not-found.tsx with a 404 status.
      return NextResponse.rewrite(absolute(request, "/_admin-not-here"));
    }
    if (onAdminHost && !ADMIN_HOST_ALLOWS.test(pathname)) {
      if (pathname === "/") return NextResponse.redirect(absolute(request, "/admin"));
      const site = process.env.SITE_URL;
      return site ? NextResponse.redirect(new URL(pathname + search, site)) : NextResponse.redirect(absolute(request, "/admin"));
    }
  }

  if (!isAdminPath || pathname === "/admin/login") return NextResponse.next();

  // Optimistic check: send visitors without a valid session to the login page.
  // Every admin page and action still checks the user and role on the server (lib/auth.ts).
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = absolute(request, "/admin/login");
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except built assets (the admin-host rules need to see page requests on every path).
  matcher: ["/((?!_next/static|_next/image).*)"],
};
