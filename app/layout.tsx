import type { Metadata } from "next";
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
  title: "出國優轉 | 台灣人出國前置工作室",
  description: "填寫行程，一鍵下載含封面、簽證、打包清單的 Word 計畫書。台灣人專屬，免費使用，不用登入。",
  openGraph: {
    title: "出國優轉 | 台灣人出國前置工作室",
    description: "填寫行程，一鍵下載含封面、簽證、打包清單的 Word 計畫書。",
    locale: "zh_TW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
