import { NextRequest } from "next/server";
import { ANYFLIP_IMAGE_HOST } from "@/lib/anyflip";

export const runtime = "nodejs";

/**
 * Image proxy. Streams a single AnyFlip page image back to the browser so the
 * client never talks to anyflip.com directly. Locked to the AnyFlip image host
 * to avoid being abused as an open proxy (SSRF protection).
 */
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return new Response("missing url", { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return new Response("invalid url", { status: 400 });
  }

  if (url.protocol !== "https:" || url.hostname !== ANYFLIP_IMAGE_HOST) {
    return new Response("forbidden host", { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      headers: { Accept: "image/webp,image/*,*/*" },
      cache: "no-store",
    });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response("upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/webp",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
