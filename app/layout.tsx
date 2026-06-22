import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.name} — ดาวน์โหลด AnyFlip เป็น PDF`,
  description: SITE.tagline,
  keywords: ["anyflip", "downloader", "pdf", "flipbook", "ดาวน์โหลด anyflip"],
  openGraph: {
    title: `${SITE.name} — ดาวน์โหลด AnyFlip เป็น PDF`,
    description: SITE.tagline,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.tagline,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
