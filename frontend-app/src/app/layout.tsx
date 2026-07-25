import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
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

// Perbarui metadata agar sesuai dengan nama proyekmu
export const metadata: Metadata = {
  title: `${APP_NAME} | Sistem Peminjaman`,
  description: "Terminal pengelolaan stok, transaksi, dan laporan aset terpusat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}