import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeOS — your AI personal assistant",
  description: "LifeOS plans your meals, outfits and daily routine so you don't have to.",
};

export const viewport: Viewport = {
  themeColor: "#08090b",
};

const THEME_SCRIPT = `
try {
  var stored = localStorage.getItem("lifeos-theme");
  var theme = stored === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">{children}</body>
    </html>
  );
}
