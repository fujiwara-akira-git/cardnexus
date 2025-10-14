'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline'

interface Card {
  id: string
  name: string
  gameTitle: string
  imageUrl: string
  expansion: string
  rarity: string
}

interface User {
  id: string
  username: string
  rating: number | null
  reviewCount: number
  profileImage: string | null
}

interface Listing {
  id: string
  listingType: 'SELL' | 'BUY' | 'TRADE'
  price: number | null
  condition: string | null
  description: string | null
  status: string
  createdAt: string
  card: Card
  user: User
}

interface ListingsResponse {
  success: boolean
  data: Listing[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  
  // フィルター状態
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    cardId: '',
    userId: '',
  })

  useEffect(() => {
    fetchListings()
  }, [page, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search }),
        ...(filters.cardId && { cardId: filters.cardId }),
        ...(filters.userId && { userId: filters.userId }),
      })

      const response = await fetch(`/api/listings?${params}`)
      const result: ListingsResponse = await response.json()

      if (result.success) {
        setListings(result.data)
        setTotalPages(result.pagination.totalPages)
      } else {
        throw new Error('出品一覧の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      setError('出品一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchListings()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPage(1)
  }

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'SELL': return '出品'
      case 'BUY': return '求購'
      case 'TRADE': return '交換'
      default: return type
    }
  }

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'SELL': return 'bg-green-100 text-green-800'
      case 'BUY': return 'bg-blue-100 text-blue-800'
      case 'TRADE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '価格未設定'
    return `¥${price.toLocaleString()}`
  }

  if (loading && listings.length === 0) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">出品・求購一覧</h1>
            <p className="text-gray-600">カードの売買・交換を探してみましょう</p>
          </div>
          <Link
            href="/listings/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            出品する
          </Link>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カード名・説明で検索
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="カード名や説明を入力"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  種別
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  <option value="SELL">出品</option>
                  <option value="BUY">求購</option>
                  <option value="TRADE">交換</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 出品一覧 */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <Link href={`/listings/${listing.id}`}>
                  <div className="relative h-64 w-full">
                    <Image
                      src={listing.card.imageUrl}
                      alt={listing.card.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(listing.listingType)}`}>
                        {getListingTypeLabel(listing.listingType)}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link href={`/listings/${listing.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {listing.card.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-2">
                    {listing.card.expansion} • {listing.card.rarity}
                  </p>
                  
                  {listing.price && (
                    <p className="text-lg font-bold text-green-600 mb-2">
                      {formatPrice(listing.price)}
                    </p>
                  )}
                  
                  {listing.condition && (
                    <p className="text-sm text-gray-600 mb-3">
                      状態: {listing.condition}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${listing.user.username}`}>
                      <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        {listing.user.profileImage ? (
                          <Image
                            src={listing.user.profileImage}
                            alt={listing.user.username}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        )}
                        <span className="text-sm text-gray-700">{listing.user.username}</span>
                      </div>
                    </Link>
                    
                    {listing.user.rating && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {listing.user.rating.toFixed(1)} ({listing.user.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(listing.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">出品が見つかりませんでした</p>
            <Link
              href="/listings/create"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
            >
              最初の出品を作成する
            </Link>
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  前へ
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 border rounded-md ${
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  次へ
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}