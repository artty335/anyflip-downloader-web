import { jsPDF } from "jspdf";

/** A decoded page ready to be placed into the PDF. */
interface RenderedPage {
  dataUrl: string;
  width: number;
  height: number;
}

const CONCURRENCY = 6;

/** Route an anyflip image URL through our same-origin proxy. */
export function proxied(imageUrl: string): string {
  return `/api/proxy?url=${encodeURIComponent(imageUrl)}`;
}

/**
 * Download every page, decode the WebP in a <canvas>, and assemble a PDF where
 * each page is sized to its image. Fetching/decoding runs with bounded
 * concurrency; `onProgress(done, total)` fires as pages complete. The PDF is
 * assembled in original page order regardless of completion order.
 */
export async function buildPdf(
  pageUrls: string[],
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  const total = pageUrls.length;
  const rendered = new Array<RenderedPage | null>(total).fill(null);
  let done = 0;

  await runPool(pageUrls.length, CONCURRENCY, async (i) => {
    if (signal?.aborted) throw new DOMException("aborted", "AbortError");
    rendered[i] = await fetchAndRender(pageUrls[i], signal);
    done++;
    onProgress(done, total);
  });

  const doc = new jsPDF({ unit: "px", compress: true });
  // jsPDF starts with one default page; remove it so every page is sized exactly.
  doc.deletePage(1);

  for (const page of rendered) {
    if (!page) continue;
    const orientation = page.width >= page.height ? "landscape" : "portrait";
    doc.addPage([page.width, page.height], orientation);
    doc.addImage(page.dataUrl, "JPEG", 0, 0, page.width, page.height, undefined, "FAST");
  }

  return doc.output("blob");
}

async function fetchAndRender(
  imageUrl: string,
  signal?: AbortSignal,
): Promise<RenderedPage> {
  const res = await fetch(proxied(imageUrl), { signal });
  if (!res.ok) throw new Error(`page fetch failed (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas not supported");
    // White matte in case of any transparency, so PDF pages aren't black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.92),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ถอดรหัสรูปไม่สำเร็จ"));
    img.src = src;
  });
}

/** Run `worker(i)` for i in [0, count) with at most `limit` in flight. */
async function runPool(
  count: number,
  limit: number,
  worker: (i: number) => Promise<void>,
): Promise<void> {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, count) }, async () => {
    while (next < count) {
      const i = next++;
      await worker(i);
    }
  });
  await Promise.all(runners);
}
