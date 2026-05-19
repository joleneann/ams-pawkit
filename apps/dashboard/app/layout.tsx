import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Inter, Lora } from "next/font/google";
import { IconProvider } from "@/components/chrome/icon-provider";
import "./globals.css";

/**
 * Pawkit font stack.
 *   - Inter — body + all headers (and `.font-display`)
 *   - Lora italic 600 — pet-name hero contexts only
 *   - Noto Sans Devanagari — Marathi fallback
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
  style: ["italic"],
  variable: "--font-lora",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = {
  title: "Animal Medical Services · Pune",
  description: "Pawkit v0 dashboard for AMS Pune",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${notoDevanagari.variable}`}
    >
      <body className="font-sans antialiased">
        <IconProvider>{children}</IconProvider>
      </body>
    </html>
  );
}
