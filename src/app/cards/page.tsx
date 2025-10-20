'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type GameType = 'ポケモンカード' | '遊戯王'

interface Card {
  id: string
  name: string
  nameJa?: string
  gameTitle: string
  cardNumber?: string
  expansion?: string
  expansionJa?: string
  rarity?: string
  effectText?: string
  effectTextJa?: string
  imageUrl?: string
  regulationMark?: string
  cardType?: string
  cardTypeJa?: string
  hp?: number
  types?: string
  typesJa?: string
  latestPrice?: number
  activeListing: number
  createdAt: string
}

interface SearchFilters {
  name: string
  gameTitle: string
  expansion: string
  rarity: string
  regulationMark: string
  cardType: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

function CardsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedGame, setSelectedGame] = useState<GameType>('ポケモンカード')
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    gameTitle: 'Pokemon TCG',
    expansion: '',
    rarity: '',
    regulationMark: '',
    cardType: ''
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  // URLパラメータを更新する関数
  const updateURLParams = useCallback((newFilters: SearchFilters, newPage: number) => {
    const params = new URLSearchParams()
    
    // フィルターをURLパラメータに追加
    params.set('page', newPage.toString())
    params.set('gameTitle', newFilters.gameTitle)
    
    if (newFilters.name) params.set('name', newFilters.name)
    if (newFilters.expansion) params.set('expansion', newFilters.expansion)
    if (newFilters.rarity) params.set('rarity', newFilters.rarity)
    if (newFilters.regulationMark) params.set('regulationMark', newFilters.regulationMark)
    if (newFilters.cardType) params.set('cardType', newFilters.cardType)
    
    // URLを更新（ページ遷移なし）
    router.push(`/cards?${params.toString()}`, { scroll: false })
  }, [router])

  // URLパラメータからフィルターを復元する関数
  const restoreFiltersFromURL = useCallback(() => {
    const urlFilters: SearchFilters = {
      name: searchParams.get('name') || '',
      gameTitle: (searchParams.get('gameTitle') as GameType) || 'Pokemon TCG',
      expansion: searchParams.get('expansion') || '',
      rarity: searchParams.get('rarity') || '',
      regulationMark: searchParams.get('regulationMark') || '',
      cardType: searchParams.get('cardType') || ''
    }
    
    const urlPage = parseInt(searchParams.get('page') || '1', 10)
    
    return { filters: urlFilters, page: urlPage }
  }, [searchParams])

  // ゲーム切り替えハンドラー
  const handleGameChange = (game: GameType) => {
    setSelectedGame(game)
    const newFilters = {
      name: '',
      gameTitle: game === 'ポケモンカード' ? 'Pokemon TCG' : game,
      expansion: '',
      rarity: '',
      regulationMark: '',
      cardType: '',
    }
    setFilters(newFilters)
    // URLを更新してページ1から再検索
    updateURLParams(newFilters, 1)
  }

  // カード一覧の取得
  const fetchCards = useCallback(async (currentFilters: SearchFilters, page: number) => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      page: page.toString(),
      limit: pagination.limit.toString(),
      gameTitle: currentFilters.gameTitle,
    })

    // その他のフィルターをクエリパラメータに追加
    if (currentFilters.name) params.append('name', currentFilters.name)
    if (currentFilters.expansion) params.append('expansion', currentFilters.expansion)
    if (currentFilters.rarity) params.append('rarity', currentFilters.rarity)
    if (currentFilters.regulationMark) params.append('regulationMark', currentFilters.regulationMark)
    if (currentFilters.cardType) params.append('cardType', currentFilters.cardType)

    try {
      const response = await fetch(`/api/cards?${params.toString()}`)
      const result = await response.json()
      console.log('API Response:', result)

      if (result.success) {
        console.log('Setting cards:', result.data.cards.length)
        console.log('Setting pagination:', result.data.pagination)
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
  }, [pagination.limit])

  // URLパラメータが変更されたら検索を実行
  useEffect(() => {
    const { filters: urlFilters, page: urlPage } = restoreFiltersFromURL()
    setFilters(urlFilters)
    setSelectedGame(urlFilters.gameTitle as GameType)
    fetchCards(urlFilters, urlPage)
  }, [searchParams, restoreFiltersFromURL, fetchCards])

  // 検索実行
  const handleSearch = () => {
    updateURLParams(filters, 1)
  }

  // フィルター入力の変更
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // フィルターのクリア
  const clearFilters = () => {
    const clearedFilters = {
      name: '',
      gameTitle: selectedGame === 'ポケモンカード' ? 'Pokemon TCG' : selectedGame,
      expansion: '',
      rarity: '',
      regulationMark: '',
      cardType: ''
    }
    setFilters(clearedFilters)
    updateURLParams(clearedFilters, 1)
  }

  // ページネーション
  const handlePageChange = (newPage: number) => {
    updateURLParams(filters, newPage)
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
          {/* ゲーム切り替えボタン */}
          <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
            <button
              onClick={() => handleGameChange('ポケモンカード')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                selectedGame === 'ポケモンカード'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">⚡</span>
              <span>ポケモンカード</span>
            </button>
            <button
              onClick={() => handleGameChange('遊戯王')}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                selectedGame === '遊戯王'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🎴</span>
              <span>遊戯王</span>
            </button>
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ゲームタイトル
                  </label>
                  <input
                    type="text"
                    placeholder="Pokemon TCG, 遊戯王..."
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
                  <label htmlFor="rarity-select" className="block text-sm font-medium text-gray-700 mb-2">
                    レアリティ
                  </label>
                  <select
                    id="rarity-select"
                    value={filters.rarity}
                    onChange={(e) => handleFilterChange('rarity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">すべて</option>
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Rare Holo">Rare Holo</option>
                    <option value="Rare Ultra">Rare Ultra</option>
                    <option value="Rare Rainbow">Rare Rainbow</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="regulation-select" className="block text-sm font-medium text-gray-700 mb-2">
                    レギュレーション
                  </label>
                  <select
                    id="regulation-select"
                    value={filters.regulationMark}
                    onChange={(e) => handleFilterChange('regulationMark', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">すべて</option>
                    <option value="G">G (スタンダード)</option>
                    <option value="H">H (スタンダード)</option>
                    <option value="I">I (スタンダード)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cardtype-select" className="block text-sm font-medium text-gray-700 mb-2">
                    カードタイプ
                  </label>
                  <select
                    id="cardtype-select"
                    value={filters.cardType}
                    onChange={(e) => handleFilterChange('cardType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">すべて</option>
                    <option value="Pokémon">ポケモン</option>
                    <option value="Trainer">トレーナー</option>
                    <option value="Energy">エネルギー</option>
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
              {cards.map((card) => {
                // 現在のURLパラメータを取得して、カード詳細ページに渡す
                const currentParams = new URLSearchParams(searchParams.toString())
                return (
                  <Link
                    key={card.id}
                    href={`/cards/${card.id}?returnUrl=${encodeURIComponent(`/cards?${currentParams.toString()}`)}`}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 hover:-translate-y-1 block"
                  >
                  {/* カード画像 */}
                  <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-t-lg">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={300}
                        height={400}
                        className="w-full h-96 object-contain rounded-t-lg bg-white"
                      />
                    ) : (
                      <div className="w-full h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400">画像なし</span>
                      </div>
                    )}
                  </div>

                  {/* カード情報 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {card.nameJa || card.name}
                    </h3>
                    {card.nameJa && card.name !== card.nameJa && (
                      <p className="text-xs text-gray-500 mb-2">{card.name}</p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{card.gameTitle}</p>
                      {(card.expansionJa || card.expansion) && (
                        <p className="truncate">{card.expansionJa || card.expansion}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {card.rarity && (
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {card.rarity}
                          </span>
                        )}
                        {card.regulationMark && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {card.regulationMark}
                          </span>
                        )}
                        {(card.cardTypeJa || card.cardType) && (
                          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {card.cardTypeJa || card.cardType}
                          </span>
                        )}
                      </div>
                      {card.hp && (
                        <p className="text-red-600 font-semibold">HP: {card.hp}</p>
                      )}
                      {(card.typesJa || card.types) && (
                        <p className="text-gray-500">タイプ: {card.typesJa || card.types}</p>
                      )}
                    </div>

                    {/* 価格・出品情報 */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
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
                    </div>
                  </div>
                </Link>
              )})}
            </div>

            {/* ページネーション */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  {/* 前のページ */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                  >
                    前
                  </button>

                  {/* ページ番号 */}
                  {Array.from({ length: Math.min(8, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 4) + i
                    if (pageNum > pagination.totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded cursor-pointer transition-colors ${
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
                    className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
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

export default function CardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">カード情報を読み込んでいます...</p>
        </div>
      </div>
    }>
      <CardsPageContent />
    </Suspense>
  )
}