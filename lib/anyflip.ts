/**
 * Cleanroom AnyFlip logic — derived purely from the publicly observable
 * behaviour of anyflip.com (URL shapes, config.js contents, image paths).
 *
 * No third-party downloader source was used.
 */

export const ANYFLIP_IMAGE_HOST = "online.anyflip.com";

export interface BookRef {
  bookId: string;
  slug: string;
}

export interface BookInfo {
  title: string;
  pageCount: number;
  /** Absolute URLs to the full-resolution (.webp) page images, in order. */
  pages: string[];
}

/**
 * Pull the stable `{bookId}/{slug}` identifier out of any AnyFlip URL the user
 * might paste, e.g.
 *   https://anyflip.com/pejfp/myfa/
 *   https://anyflip.com/pejfp/myfa/basic
 *   anyflip.com/pejfp/myfa
 *   https://online.anyflip.com/pejfp/myfa/mobile/index.html
 */
export function parseBookUrl(input: string): BookRef {
  const raw = input.trim();
  if (!raw) throw new BookError("กรุณาวางลิงก์ AnyFlip");

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    throw new BookError("ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
  }

  if (!/(^|\.)anyflip\.com$/i.test(url.hostname)) {
    throw new BookError("ลิงก์นี้ไม่ใช่ AnyFlip — ต้องเป็นลิงก์จาก anyflip.com");
  }

  // First two non-empty path segments are bookId/slug.
  const segments = url.pathname.split("/").filter(Boolean);
  const [bookId, slug] = segments;
  if (!bookId || !slug) {
    throw new BookError(
      "หาเล่มหนังสือจากลิงก์ไม่เจอ — ลิงก์ควรเป็นแบบ anyflip.com/xxxxx/yyyy/",
    );
  }
  return { bookId, slug };
}

/** URL of the flipbook config script for a given book. */
export function buildConfigUrl({ bookId, slug }: BookRef): string {
  return `https://${ANYFLIP_IMAGE_HOST}/${bookId}/${slug}/mobile/javascript/config.js`;
}

/**
 * Base URL that page image paths in the config are relative to. The flipbook
 * loader lives at `.../{slug}/mobile/`, so a config path like `../files/large/x`
 * resolves to `.../{slug}/files/large/x` (note: trailing slash is required for
 * `new URL` to treat it as a directory).
 */
export function buildPageBaseUrl({ bookId, slug }: BookRef): string {
  return `https://${ANYFLIP_IMAGE_HOST}/${bookId}/${slug}/mobile/`;
}

/**
 * Parse the `config.js` script text into a BookInfo. The script defines a JS
 * object containing a `fliphtml5_pages` array; each entry carries the relative
 * path(s) to that page's image under a `n` key. We never `eval` the script — we
 * extract the array as JSON and resolve each path against the page base URL so
 * the sequential-vs-hashed filename difference is handled automatically.
 */
export function parseConfig(scriptText: string, pageBaseUrl: string): BookInfo {
  const pagesArray = extractPagesArray(scriptText);
  if (!pagesArray.length) {
    throw new BookError("อ่านข้อมูลหน้าหนังสือไม่ได้ (รูปแบบ config เปลี่ยนไป?)");
  }

  const pages = pagesArray.map((entry, i) => {
    const rel = pickImagePath(entry);
    if (!rel) {
      throw new BookError(`หาไฟล์รูปของหน้า ${i + 1} ไม่เจอใน config`);
    }
    return new URL(rel, pageBaseUrl).href;
  });

  return {
    title: extractTitle(scriptText),
    pageCount: pages.length,
    pages,
  };
}

/** A page entry from the config — shape kept loose since it's external data. */
type PageEntry = { n?: unknown; t?: unknown } | string;

/** Choose the largest-resolution relative image path from a page entry. */
function pickImagePath(entry: PageEntry): string | null {
  if (typeof entry === "string") return entry || null;
  const n = entry?.n;
  if (Array.isArray(n)) {
    // `n` lists resolutions; the entries are large/normal — take the first.
    const first = n.find((p) => typeof p === "string" && p.length > 0);
    return (first as string) ?? null;
  }
  if (typeof n === "string" && n.length > 0) return n;
  return null;
}

/**
 * Extract the `fliphtml5_pages` array by finding its opening `[` and walking to
 * the matching `]` (respecting strings), then JSON.parse it.
 */
function extractPagesArray(text: string): PageEntry[] {
  const keyIdx = text.indexOf("fliphtml5_pages");
  if (keyIdx === -1) return [];
  const start = text.indexOf("[", keyIdx);
  if (start === -1) return [];

  let depth = 0;
  let inStr = false;
  let quote = "";
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") {
        i++; // skip escaped char
      } else if (ch === quote) {
        inStr = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inStr = true;
      quote = ch;
    } else if (ch === "[") {
      depth++;
    } else if (ch === "]") {
      depth--;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        return parseArrayLoose(slice);
      }
    }
  }
  return [];
}

/** JSON.parse the array; if it uses single quotes, normalise then retry. */
function parseArrayLoose(slice: string): PageEntry[] {
  try {
    return JSON.parse(slice) as PageEntry[];
  } catch {
    // Fallback: convert single-quoted strings to double-quoted JSON.
    try {
      const normalised = slice.replace(/'/g, '"');
      return JSON.parse(normalised) as PageEntry[];
    } catch {
      return [];
    }
  }
}

/** Best-effort title extraction; falls back to a generic name. */
function extractTitle(text: string): string {
  const patterns = [
    /"?bookTitle"?\s*[:=]\s*"((?:[^"\\]|\\.)*)"/i,
    /"?title"?\s*[:=]\s*"((?:[^"\\]|\\.)*)"/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1].trim()) {
      return decodeTitle(m[1].trim());
    }
  }
  return "anyflip-book";
}

function decodeTitle(s: string): string {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\(.)/g, "$1");
}

/** Make a title safe to use as a download filename. */
export function safeFileName(title: string): string {
  const cleaned = title
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return (cleaned || "anyflip-book") + ".pdf";
}

/** Error type whose message is safe (and friendly) to show to the user. */
export class BookError extends Error {}
