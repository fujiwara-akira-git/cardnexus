'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ListingItem {
  id: string
  cardName: string
  cardImage?: string
  price: number
  condition: string
  status: 'ACTIVE' | 'PENDING' | 'SOLD'
  createdAt: string
  views?: number
}

interface MyListingsProps {
  listings: ListingItem[]
}

const getStatusColor = (status: ListingItem['status']) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'SOLD':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: ListingItem['status']) => {
  switch (status) {
    case 'ACTIVE':
      return '出品中'
    case 'PENDING':
      return '交渉中'
    case 'SOLD':
      return '売却済み'
    default:
      return status
  }
}

export function MyListings({ listings }: MyListingsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">出品中のアイテム</h3>
        <Link
          href="/listings/create"
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
        >
          新規出品
        </Link>
      </div>
      <div className="p-6">
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">まだ出品がありません</p>
            <Link
              href="/listings/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              最初の出品を作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  {listing.cardImage ? (
                    <Image
                      src={listing.cardImage}
                      alt={listing.cardName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">🎴</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {listing.cardName}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-gray-900">
                      ¥{listing.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">• {listing.condition}</span>
                    {listing.views && (
                      <span className="text-sm text-gray-500">• {listing.views}回閲覧</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {getStatusText(listing.status)}
                  </span>
                  <span className="text-xs text-gray-400">{listing.createdAt}</span>
                </div>
              </div>
            ))}
            {listings.length > 5 && (
              <div className="text-center">
                <Link
                  href="/listings/my"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  すべての出品を見る ({listings.length}件)
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}