import { after } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { createLead, notifyLead } from "@/lib/leads";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`lead:${ip}`, 6, 10 * 60_000)) {
    return Response.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return Response.json({ error: "Please check the highlighted fields.", fieldErrors }, { status: 400 });
  }

  // Honeypot filled in → pretend success so bots don't retry.
  if (parsed.data.website) return Response.json({ ref: "OK" });

  const created = await createLead(parsed.data);
  after(() => notifyLead(created));
  return Response.json({ ref: created.lead.ref }, { status: 201 });
}
