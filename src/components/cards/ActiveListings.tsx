'use client'

import Image from 'next/image'
import Link from 'next/link'

interface ActiveListing {
  id: string
  type: 'BUY' | 'SELL' | 'TRADE'
  price?: number
  condition: string
  quantity: number
  description?: string
  user: {
    id: string
    name?: string
    username: string
    image?: string
    rating: number
    reviewCount: number
  }
  createdAt: string
  expiresAt?: string
}

interface ActiveListingsProps {
  listings: ActiveListing[]
}

export function ActiveListings({ listings }: ActiveListingsProps) {
  const sellListings = listings.filter(listing => listing.type === 'SELL')
  const buyListings = listings.filter(listing => listing.type === 'BUY')
  const tradeListings = listings.filter(listing => listing.type === 'TRADE')

  const formatPrice = (price?: number) => {
    if (!price) return '応相談'
    return `¥${Math.round(price).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'MINT': return 'text-green-600 bg-green-50'
      case 'NEAR_MINT': return 'text-blue-600 bg-blue-50'
      case 'EXCELLENT': return 'text-indigo-600 bg-indigo-50'
      case 'GOOD': return 'text-yellow-600 bg-yellow-50'
      case 'PLAYED': return 'text-orange-600 bg-orange-50'
      case 'POOR': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'MINT': return '完美品'
      case 'NEAR_MINT': return '極美品'
      case 'EXCELLENT': return '美品'
      case 'GOOD': return '良品'
      case 'PLAYED': return 'やや傷あり'
      case 'POOR': return '傷あり'
      default: return condition
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SELL': return 'text-red-600 bg-red-50'
      case 'BUY': return 'text-green-600 bg-green-50'
      case 'TRADE': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SELL': return '売ります'
      case 'BUY': return '買います'
      case 'TRADE': return '交換'
      default: return type
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const ListingCard = ({ listing }: { listing: ActiveListing }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
          {getTypeText(listing.type)}
        </span>
        <span className="text-sm text-gray-500">
          {formatDate(listing.createdAt)}
        </span>
      </div>

      {/* 価格とコンディション */}
      <div className="mb-3">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {formatPrice(listing.price)}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(listing.condition)}`}>
            {getConditionText(listing.condition)}
          </span>
          <span className="text-sm text-gray-600">
            数量: {listing.quantity}
          </span>
        </div>
      </div>

      {/* 説明 */}
      {listing.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* ユーザー情報 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          {listing.user.image ? (
            <Image
              src={listing.user.image}
              alt={listing.user.name || listing.user.username}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {(listing.user.name || listing.user.username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <Link 
              href={`/profile/${listing.user.id}`}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
            >
              {listing.user.name || listing.user.username}
            </Link>
            <div className="flex items-center space-x-1">
              <div className="flex">
                {renderStars(listing.user.rating)}
              </div>
              <span className="text-xs text-gray-500">
                ({listing.user.reviewCount})
              </span>
            </div>
          </div>
        </div>
        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          詳細
        </button>
      </div>
    </div>
  )

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">出品がありません</h3>
        <p className="mt-1 text-sm text-gray-500">このカードの出品情報がまだありません</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">現在の出品</h3>
        <span className="text-sm text-gray-500">
          {listings.length}件の出品
        </span>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {sellListings.length > 0 && (
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              売り ({sellListings.length})
            </button>
          )}
          {buyListings.length > 0 && (
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              買い ({buyListings.length})
            </button>
          )}
          {tradeListings.length > 0 && (
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              交換 ({tradeListings.length})
            </button>
          )}
        </nav>
      </div>

      {/* リスト表示 */}
      <div className="space-y-4">
        {/* 売り出品 */}
        {sellListings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">売り出品</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {sellListings.slice(0, 4).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* 買い求め */}
        {buyListings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">買い求め</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {buyListings.slice(0, 4).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* 交換 */}
        {tradeListings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">交換希望</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {tradeListings.slice(0, 4).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* もっと見るリンク */}
      {listings.length > 4 && (
        <div className="mt-6 text-center">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            すべての出品を見る ({listings.length}件)
          </button>
        </div>
      )}
    </div>
  )
}