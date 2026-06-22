/**
 * Site-wide constants. Edit these to point at your own repo / tip page.
 * These can be overridden at build time via NEXT_PUBLIC_* env vars.
 */
export const SITE = {
  name: "AnyFlip Downloader",
  tagline: "ดาวน์โหลด AnyFlip เป็น PDF ง่ายๆ ในเบราว์เซอร์ ไม่ต้องใช้ terminal",
  taglineEn: "Download AnyFlip flipbooks as PDF — right in your browser.",
  githubUrl:
    process.env.NEXT_PUBLIC_GITHUB_URL ??
    "https://github.com/artty335/anyflip-downloader-web",
  coffeeUrl:
    process.env.NEXT_PUBLIC_COFFEE_URL ?? "https://www.buymeacoffee.com/artty3354s",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anyflip-downloader.example.com",
} as const;
