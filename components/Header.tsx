import { SITE } from "@/lib/config";

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <a href="/" className="flex items-center gap-2 font-bold text-brand">
        <span className="text-2xl">📖</span>
        <span className="text-lg">{SITE.name}</span>
      </a>
      <a
        href={SITE.githubUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand hover:text-brand"
      >
        <span>⭐</span> Star on GitHub
      </a>
    </header>
  );
}
