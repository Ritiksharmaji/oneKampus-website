import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Product photos go to Cloudinary when it is configured (production on AWS Lambda has no lasting disk).
// Without Cloudinary they are saved to UPLOAD_DIR (./uploads by default) and served by /media/[file].
// The ignore comment stops the bundler from tracing the whole project folder for this runtime path.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;
const CLOUDINARY_FOLDER = "onekampus/products";

const cloudinary = () => {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  return cloud && key && secret ? { cloud, key, secret } : null;
};

/** Signed Cloudinary API call (https://cloudinary.com/documentation/upload_images#generating_authentication_signatures). */
async function cloudinaryCall(action: "upload" | "destroy", params: Record<string, string>, file?: Blob) {
  const c = cloudinary()!;
  const signed = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
  const toSign = Object.keys(signed).sort().map((k) => `${k}=${signed[k as keyof typeof signed]}`).join("&");
  const body = new FormData();
  for (const [k, v] of Object.entries(signed)) body.set(k, v);
  body.set("api_key", c.key);
  body.set("signature", createHash("sha1").update(toSign + c.secret).digest("hex"));
  if (file) body.set("file", file);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/image/${action}`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Cloudinary ${action} failed: ${data?.error?.message ?? res.status}`);
  return data as { secure_url?: string };
}

/** Saves an uploaded image and returns its public URL, or an error message. */
export async function saveImage(file: File): Promise<{ url: string } | { error: string }> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Upload a JPG, PNG or WebP image." };
  if (file.size > MAX_BYTES) return { error: "Images can be up to 5 MB." };

  const name = randomBytes(12).toString("hex");
  if (cloudinary()) {
    try {
      const data = await cloudinaryCall("upload", { folder: CLOUDINARY_FOLDER, public_id: name }, file);
      return { url: data.secure_url! };
    } catch (e) {
      console.error(e);
      return { error: "The photo couldn't be uploaded. Please try again." };
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, `${name}.${ext}`), Buffer.from(await file.arrayBuffer()));
  return { url: `/media/${name}.${ext}` };
}

export async function deleteImage(url: string | null | undefined) {
  if (!url) return;
  const publicId = url.match(/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)\.\w+$/)?.[1];
  if (publicId && cloudinary()) {
    await cloudinaryCall("destroy", { public_id: publicId }).catch((e) => console.error(e));
    return;
  }
  if (url.startsWith("/media/")) {
    await unlink(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, path.basename(url))).catch(() => {});
  }
}
