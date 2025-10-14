'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Card {
  id: string
  name: string
  gameTitle: string
  cardNumber?: string
  expansion?: string
  rarity?: string
  effectText?: string
  imageUrl?: string
  latestPrice?: number
  activeListing: number
  createdAt: string
}

interface SearchFilters {
  name: string
  gameTitle: string
  expansion: string
  rarity: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    gameTitle: '',
    expansion: '',
    rarity: ''
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  // カード一覧の取得
  const fetchCards = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page: page.toString(),
      limit: pagination.limit.toString()
    })

    // フィルターをクエリパラメータに追加
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        params.append(key, value.trim())
      }
    })

    try {
      const response = await fetch(`/api/cards?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setCards(result.data.cards)
        setPagination(result.data.pagination)
      } else {
        setError(result.error || 'カードの取得に失敗しました')
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
      console.error('Fetch cards error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  // 初回読み込み
  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // 検索実行
  const handleSearch = () => {
    fetchCards(1)
  }

  // フィルター入力の変更
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // フィルターのクリア
  const clearFilters = () => {
    setFilters({
      name: '',
      gameTitle: '',
      expansion: '',
      rarity: ''
    })
  }

  // ページネーション
  const handlePageChange = (newPage: number) => {
    fetchCards(newPage)
  }

  // 価格フォーマット
  const formatPrice = (price?: number) => {
    if (!price) return '価格情報なし'
    return `¥${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            カードデータベース
          </h1>
          <p className="text-gray-600">
            カードの検索・価格情報・出品状況を確認できます
          </p>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* メイン検索 */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="カード名で検索..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* 検索ボタン */}
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              検索
            </button>

            {/* フィルター切り替え */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              詳細フィルター
            </button>
          </div>

          {/* 詳細フィルター */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ゲームタイトル
                  </label>
                  <input
                    type="text"
                    placeholder="ポケモンカード, 遊戯王..."
                    value={filters.gameTitle}
                    onChange={(e) => handleFilterChange('gameTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    拡張パック
                  </label>
                  <input
                    type="text"
                    placeholder="スターバース, VSTARユニバース..."
                    value={filters.expansion}
                    onChange={(e) => handleFilterChange('expansion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    レアリティ
                  </label>
                  <select
                    value={filters.rarity}
                    onChange={(e) => handleFilterChange('rarity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">すべて</option>
                    <option value="RRR">RRR</option>
                    <option value="RR">RR</option>
                    <option value="R">R</option>
                    <option value="U">U</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                フィルターをクリア
              </button>
            </div>
          )}
        </div>

        {/* 読み込み中 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">カードを読み込み中...</p>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* カード一覧 */}
        {!loading && !error && (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {pagination.totalCount}件のカードが見つかりました
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  {/* カード画像 */}
                  <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-t-lg">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={300}
                        height={192}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400">画像なし</span>
                      </div>
                    )}
                  </div>

                  {/* カード情報 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {card.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{card.gameTitle}</p>
                      {card.expansion && (
                        <p className="truncate">{card.expansion}</p>
                      )}
                      {card.rarity && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {card.rarity}
                        </span>
                      )}
                    </div>

                    {/* 価格・出品情報 */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(card.latestPrice)}
                          </p>
                          {card.activeListing > 0 && (
                            <p className="text-sm text-green-600">
                              {card.activeListing}件の出品
                            </p>
                          )}
                        </div>
                        <a
                          href={`/cards/${card.id}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          詳細
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  {/* 前のページ */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    前
                  </button>

                  {/* ページ番号 */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i
                    if (pageNum > pagination.totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {/* 次のページ */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    次
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}