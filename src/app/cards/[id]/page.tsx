import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CardDetailClient from './CardDetailClient';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const baseUrl = typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : "";
  const apiUrl = typeof window === "undefined"
    ? `${baseUrl}/api/cards/${id}`
    : `/api/cards/${id}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-600">
        <Header />
        <div>カード情報の取得に失敗しました</div>
        <Footer />
      </div>
    );
  }
  const { data: card } = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">カード詳細情報</h1>
          <CardDetailClient card={card} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
 