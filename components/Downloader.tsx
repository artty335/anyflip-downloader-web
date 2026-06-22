"use client";

import { useRef, useState } from "react";
import { buildPdf } from "@/lib/pdf";
import { safeFileName } from "@/lib/anyflip";

type Phase = "idle" | "resolving" | "downloading" | "done" | "error";

interface BookInfo {
  title: string;
  pageCount: number;
  pages: string[];
}

export function Downloader() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [book, setBook] = useState<BookInfo | null>(null);
  const [done, setDone] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const busy = phase === "resolving" || phase === "downloading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBook(null);
    setDone(0);
    setPhase("resolving");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด");

      const info = data as BookInfo;
      setBook(info);
      setPhase("downloading");

      const blob = await buildPdf(
        info.pages,
        (d) => setDone(d),
        controller.signal,
      );

      triggerDownload(blob, safeFileName(info.title));
      setPhase("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPhase("error");
    } finally {
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  const total = book?.pageCount ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl shadow-brand/5 ring-1 ring-slate-200/70 sm:p-8">
      <label htmlFor="anyflip-url" className="mb-2 block text-sm font-medium text-slate-700">
        ลิงก์หนังสือ AnyFlip
      </label>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          id="anyflip-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="เช่น https://anyflip.com/xxxxx/yyyy/"
          disabled={busy}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 caret-brand outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50 disabled:text-slate-500"
        />
        {busy ? (
          <button
            type="button"
            onClick={handleCancel}
            className="whitespace-nowrap rounded-xl bg-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-300"
          >
            ยกเลิก
          </button>
        ) : (
          <button
            type="submit"
            disabled={!url.trim()}
            className="whitespace-nowrap rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ดาวน์โหลด PDF
          </button>
        )}
      </form>

      {phase === "resolving" && (
        <p className="mt-4 text-sm text-slate-500">กำลังอ่านข้อมูลหนังสือ…</p>
      )}

      {phase === "downloading" && book && (
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-slate-700 line-clamp-1">
              {book.title}
            </span>
            <span className="text-slate-500">
              {done}/{total} หน้า
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {phase === "done" && book && (
        <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          ✅ เสร็จแล้ว! ดาวน์โหลด “{book.title}” ({total} หน้า) เรียบร้อย
        </p>
      )}

      {phase === "error" && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
