import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploaded images live outside the build (./uploads by default) and are served by /media/[file].
// The ignore comment stops the bundler from tracing the whole project folder for this runtime path.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

/** Saves an uploaded image and returns its public URL, or an error message. */
export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Upload a JPG, PNG or WebP image." };
  if (file.size > MAX_BYTES) return { error: "Images can be up to 5 MB." };

  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/media/${name}` };
}

export async function deleteImage(url: string | null | undefined) {
  if (!url?.startsWith("/media/")) return;
  await unlink(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, path.basename(url))).catch(() => {});
}
