'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  HeartIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  username: string
  profileImageUrl: string | null
}

interface Card {
  id: string
  name: string
  imageUrl: string | null
  rarity: string | null
  quantity: number
}

interface Deck {
  id: string
  name: string
  description: string | null
  gameTitle: string
  format: string | null
  isPublic: boolean
  likeCount: number
  viewCount: number
  coverImageUrl: string | null
  createdAt: string
  updatedAt: string
  user: User
  cardCount: number
  totalLikes: number
  tags: string[]
  sampleCards: Card[]
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

const gameOptions = [
  { value: '', label: 'すべてのゲーム' },
  { value: 'ポケモンカード', label: 'ポケモンカード' },
  { value: '遊戯王', label: '遊戯王' },
  { value: 'マジック:ザ・ギャザリング', label: 'MTG' },
  { value: 'デュエル・マスターズ', label: 'デュエマス' },
]

const formatOptions = [
  { value: '', label: 'すべてのフォーマット' },
  { value: 'スタンダード', label: 'スタンダード' },
  { value: 'エクスパンデッド', label: 'エクスパンデッド' },
  { value: 'アンリミテッド', label: 'アンリミテッド' },
]

const sortOptions = [
  { value: 'createdAt', label: '投稿日時' },
  { value: 'popularity', label: '人気順' },
  { value: 'views', label: '閲覧数' },
  { value: 'updatedAt', label: '更新日時' },
]

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // フィルタ・検索状態
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm,
        gameTitle: selectedGame,
        format: selectedFormat,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/decks?${params}`)
      const result = await response.json()

      if (result.success) {
        setDecks(result.data.decks)
        setPagination(result.data.pagination)
      } else {
        throw new Error(result.error?.message || 'デッキの取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching decks:', error)
      setError(error instanceof Error ? error.message : 'デッキの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedGame, selectedFormat, sortBy, sortOrder, currentPage])

  useEffect(() => {
    fetchDecks()
  }, [fetchDecks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchDecks()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedGame('')
    setSelectedFormat('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading && decks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">デッキ一覧</h1>
            <p className="mt-2 text-gray-600">
              コミュニティが作成したデッキを見つけよう
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/decks/builder"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新しいデッキを作成
            </Link>
          </div>
        </div>

        {/* 検索・フィルタエリア */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="デッキ名・説明で検索..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  フィルタ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  検索
                </button>
              </div>
            </div>
          </form>

          {/* フィルタオプション */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ゲーム
                  </label>
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {gameOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    フォーマット
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    並び順
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    順序
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">降順</option>
                    <option value="asc">昇順</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  フィルタをリセット
                </button>
              </div>
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* デッキ一覧 */}
        {decks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {decks.map((deck) => (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    {/* デッキカバー画像エリア */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-4">
                      {deck.coverImageUrl ? (
                        <Image
                          src={deck.coverImageUrl}
                          alt={deck.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        // サンプルカードを表示
                        <div className="flex justify-center items-center h-full">
                          <div className="grid grid-cols-2 gap-2">
                            {deck.sampleCards.slice(0, 4).map((card, index) => (
                              <div key={index} className="w-12 h-16 relative">
                                {card.imageUrl ? (
                                  <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    fill
                                    className="object-cover rounded shadow-md"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-500">?</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* フォーマットバッジ */}
                      {deck.format && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {deck.format}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {/* デッキ名 */}
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {deck.name}
                      </h3>

                      {/* ゲームタイトル */}
                      <p className="text-sm text-blue-600 mb-2">{deck.gameTitle}</p>

                      {/* 説明 */}
                      {deck.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {deck.description}
                        </p>
                      )}

                      {/* タグ */}
                      {deck.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {deck.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {deck.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{deck.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 作成者情報 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {deck.user.profileImageUrl ? (
                            <Image
                              src={deck.user.profileImageUrl}
                              alt={deck.user.username}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          )}
                          <span className="text-sm text-gray-700">{deck.user.username}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(deck.createdAt)}
                        </span>
                      </div>

                      {/* 統計情報 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <HeartIcon className="h-4 w-4" />
                            <span>{deck.totalLikes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{deck.viewCount}</span>
                          </div>
                        </div>
                        <div>
                          <span>{deck.cardCount}枚</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ページネーション */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    前へ
                  </button>
                  
                  {/* ページ番号 */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">デッキが見つかりませんでした</p>
            <Link
              href="/decks/builder"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              最初のデッキを作成する
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}