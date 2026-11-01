import type { Metadata } from "next";
import { Figtree, Sora } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["500", "600", "700"] });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "oneKampus — software and supplies for every institute", template: "%s · oneKampus" },
  description:
    "oneKampus gives schools, colleges and coaching institutes everything they need: institute management, online learning, exams and hiring software, plus custom notebooks, uniforms and stationery.",
  openGraph: { type: "website", siteName: "oneKampus", locale: "en_IN" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${figtree.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
