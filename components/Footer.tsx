import { SITE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={SITE.coffeeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300"
        >
          ☕ Buy me a coffee
        </a>
        <a
          href={SITE.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:border-brand hover:text-brand"
        >
          ⭐ ถ้าชอบ ฝาก Star ให้ด้วยนะ
        </a>
      </div>
      <p className="mt-6 text-xs text-slate-400">
        เครื่องมือนี้เป็นโอเพนซอร์ส ใช้สำหรับดาวน์โหลดเนื้อหาที่คุณมีสิทธิ์เท่านั้น
        ผู้พัฒนาไม่มีส่วนเกี่ยวข้องกับ AnyFlip
      </p>
    </footer>
  );
}
