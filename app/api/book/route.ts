import { NextRequest, NextResponse } from "next/server";
import {
  BookError,
  buildConfigUrl,
  buildPageBaseUrl,
  parseBookUrl,
  parseConfig,
} from "@/lib/anyflip";

export const runtime = "nodejs";

/**
 * Resolve an AnyFlip book URL into { title, pageCount, pages[] }.
 * The page URLs returned point at anyflip; the browser fetches them through
 * /api/proxy.
 */
export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const ref = parseBookUrl(body.url ?? "");
    const configUrl = buildConfigUrl(ref);

    const res = await fetch(configUrl, {
      headers: { Accept: "application/javascript,text/javascript,*/*" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "โหลดข้อมูลหนังสือไม่ได้ — เล่มนี้อาจถูกลบหรือเป็นแบบส่วนตัว" },
        { status: 404 },
      );
    }

    const scriptText = await res.text();
    const info = parseConfig(scriptText, buildPageBaseUrl(ref));
    return NextResponse.json(info);
  } catch (err) {
    if (err instanceof BookError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 },
    );
  }
}
