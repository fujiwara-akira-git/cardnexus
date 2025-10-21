import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

interface Card {
  id: string;
  name: string;
  imageUrl: string | null;
  rarity: string | null;
  cardNumber: string | null;
  cardType: string | null;
}

interface SetData {
  id: string;
  name: string;
  series: string;
  releaseDate: string | null;
  totalCards: number | null;
  printedTotal: number | null;
  legalities: Record<string, string> | null;
  images: {
    symbol?: string;
    logo?: string;
  } | null;
  ptcgoCode: string | null;
  cards: Card[];
  _count: {
    cards: number;
  };
}

const SetDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  // Fetch set data
  const baseUrl = typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : "";
  const apiUrl = typeof window === "undefined"
    ? `${baseUrl}/api/sets/${id}`
    : `/api/sets/${id}`;

  const res = await fetch(apiUrl, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-600">
        <Header />
        <div>セット情報の取得に失敗しました</div>
        <Footer />
      </div>
    );
  }

  const { data: set }: { data: SetData } = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Set Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Set Images */}
            <div className="flex flex-col items-center space-y-4">
              {set.images?.symbol && (
                <Image
                  src={set.images.symbol}
                  alt={`${set.name} symbol`}
                  width={80}
                  height={80}
                  className="rounded"
                />
              )}
              {set.images?.logo && (
                <Image
                  src={set.images.logo}
                  alt={`${set.name} logo`}
                  width={200}
                  height={100}
                  className="rounded"
                />
              )}
            </div>

            {/* Set Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{set.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{set.series}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">セットID:</span>
                  <p className="text-gray-900">{set.id}</p>
                </div>
                {set.releaseDate && (
                  <div>
                    <span className="font-medium text-gray-700">発売日:</span>
                    <p className="text-gray-900">{new Date(set.releaseDate).toLocaleDateString('ja-JP')}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">カード数:</span>
                  <p className="text-gray-900">{set._count.cards} / {set.totalCards || '不明'}</p>
                </div>
                {set.printedTotal && (
                  <div>
                    <span className="font-medium text-gray-700">印刷枚数:</span>
                    <p className="text-gray-900">{set.printedTotal}</p>
                  </div>
                )}
                {set.ptcgoCode && (
                  <div className="col-span-2 lg:col-span-1">
                    <span className="font-medium text-gray-700">PTCGOコード:</span>
                    <p className="text-gray-900">{set.ptcgoCode}</p>
                  </div>
                )}
              </div>

              {/* Legalities */}
              {set.legalities && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">リーガリティ:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(set.legalities).map(([format, status]) => (
                      <span
                        key={format}
                        className={`px-2 py-1 text-xs rounded ${
                          status === 'Legal'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {format}: {status as string}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards in Set */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              収録カード ({set._count.cards}枚)
            </h2>
            <Link
              href="/sets"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← セット一覧に戻る
            </Link>
          </div>

          {set.cards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              このセットのカードデータがありません
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {set.cards.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
                    {/* Card Image */}
                    <div className="aspect-[2.5/3.5] mb-2 flex items-center justify-center bg-white rounded border">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          width={120}
                          height={168}
                          className="rounded object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="text-xs text-gray-400 text-center p-2">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900 truncate mb-1">
                        {card.name}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>{card.cardNumber}</span>
                        {card.rarity && (
                          <span className="truncate ml-1">{card.rarity}</span>
                        )}
                      </div>
                      {card.cardType && (
                        <span className="inline-block mt-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          {card.cardType}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetDetailPage;