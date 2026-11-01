// Helpers to read admin form fields. List-like fields are edited as plain text, one entry per line,
// with " | " between parts — e.g. a feature is "Title | Description".

export const str = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();
export const optStr = (fd: FormData, name: string) => str(fd, name) || null;
export const bool = (fd: FormData, name: string) => fd.get(name) === "on";
export const int = (fd: FormData, name: string, fallback = 0) => {
  const n = Number.parseInt(str(fd, name), 10);
  return Number.isFinite(n) ? n : fallback;
};

export const lines = (text: string) => text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
export const splitLine = (line: string) => line.split("|").map((p) => p.trim());

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** "a | b" lines → [{ [k1]: a, [k2]: b }] — lines without a second part are skipped. */
export function pairs<K1 extends string, K2 extends string>(text: string, k1: K1, k2: K2) {
  return lines(text)
    .map(splitLine)
    .filter((p) => p[0] && p[1])
    .map(([a, ...rest]) => ({ [k1]: a, [k2]: rest.join(" | ") }) as Record<K1 | K2, string>);
}

// Reverse direction, for filling the textareas.
export const toLines = (rows: Record<string, unknown>[], k1: string, k2: string) =>
  rows.map((r) => `${r[k1]} | ${r[k2]}`).join("\n");
