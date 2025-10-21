'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Set {
  id: string;
  name: string;
  series: string;
  releaseDate: string | null;
  totalCards: number | null;
  printedTotal: number | null;
  images: {
    symbol?: string;
    logo?: string;
  } | null;
  ptcgoCode: string | null;
  _count: {
    cards: number;
  };
}

interface SetsResponse {
  data: Set[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const SetsPage = () => {
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('');

  const fetchSets = async (pageNum: number = 1, searchTerm: string = '', series: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '24'
      });
      if (searchTerm) params.append('search', searchTerm);
      if (series) params.append('series', series);

      const response = await fetch(`/api/sets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sets');

      const data: SetsResponse = await response.json();
      setSets(data.data);
      setTotalPages(data.pagination.pages);
      setPage(data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets(1, search, selectedSeries);
  }, [search, selectedSeries]);

  const handlePageChange = (newPage: number) => {
    fetchSets(newPage, search, selectedSeries);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSets(1, search, selectedSeries);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">
            エラー: {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ポケモンカードセット一覧</h1>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="セット名またはIDで検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべてのシリーズ</option>
                  <option value="Base">Base</option>
                  <option value="EX">EX</option>
                  <option value="Diamond & Pearl">Diamond & Pearl</option>
                  <option value="Platinum">Platinum</option>
                  <option value="HeartGold & SoulSilver">HeartGold & SoulSilver</option>
                  <option value="Black & White">Black & White</option>
                  <option value="XY">XY</option>
                  <option value="Sun & Moon">Sun & Moon</option>
                  <option value="Sword & Shield">Sword & Shield</option>
                  <option value="Scarlet & Violet">Scarlet & Violet</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                検索
              </button>
            </form>
          </div>

          {/* Sets Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sets.map((set) => (
                  <Link
                    key={set.id}
                    href={`/sets/${set.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Set Image */}
                      <div className="flex justify-center mb-4">
                        {set.images?.symbol ? (
                          <Image
                            src={set.images.symbol}
                            alt={set.name}
                            width={64}
                            height={64}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Set Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{set.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{set.series}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>ID: {set.id}</p>
                          {set.releaseDate && <p>発売日: {new Date(set.releaseDate).toLocaleDateString('ja-JP')}</p>}
                          <p>カード数: {set._count.cards} / {set.totalCards || '不明'}</p>
                          {set.ptcgoCode && <p>PTCGO: {set.ptcgoCode}</p>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      前へ
                    </button>

                    <span className="px-3 py-2 text-sm text-gray-700">
                      {page} / {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      次へ
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SetsPage;