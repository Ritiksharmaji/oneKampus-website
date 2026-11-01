import { readFile } from "node:fs/promises";
import path from "node:path";
import { IMAGE_TYPES, UPLOAD_DIR } from "@/lib/uploads";

const CONTENT_TYPES = Object.fromEntries(Object.entries(IMAGE_TYPES).map(([type, ext]) => [ext, type]));

export async function GET(_: Request, { params }: RouteContext<"/media/[file]">) {
  const { file } = await params;
  // Only plain generated names like "3f9a….webp" — no paths.
  if (!/^[a-f0-9]{24}\.(jpg|png|webp)$/.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(data, {
      headers: {
        "Content-Type": CONTENT_TYPES[file.split(".").pop()!],
        // Names are random and never reused, so the file can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
