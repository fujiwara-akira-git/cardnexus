import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from '@/components/Providers'
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
  title: "Card Nexus - カードゲームプレイヤーの情報交換・取引プラットフォーム",
  description: "すべてのカードゲームプレイヤーが集う、情報と交流の拠点。カード検索、価格情報、デッキ構築、売買まで全て一つのプラットフォームで。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
