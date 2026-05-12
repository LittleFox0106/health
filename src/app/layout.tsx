import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthButton } from "@/components/AuthButton";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "健康测评",
  description: "健康测评系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50 flex items-center justify-between px-6">
          <span className="text-lg font-bold text-blue-600">健康测评</span>
          <AuthButton />
        </header>
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
