'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserProfile {
  id: string
  username: string
  email: string
  profileImageUrl?: string
  bio?: string
  rating: number
  reviewCount: number
  memberSince: string
  isCurrentUser: boolean
  stats: {
    totalListings: number
    completedTransactions: number
    activeListing: number
  }
}

interface Transaction {
  id: string
  type: 'PURCHASE' | 'SALE' | 'TRADE'
  cardName: string
  price?: number
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
  completedAt: string
  otherUser: {
    id: string
    username: string
    rating: number
  }
}

interface Review {
  id: string
  rating: number
  comment?: string
  reviewerId: string
  reviewerName: string
  reviewerImage?: string
  transactionType: 'PURCHASE' | 'SALE' | 'TRADE'
  cardName: string
  createdAt: string
}

interface Listing {
  id: string
  type: 'SELL' | 'BUY' | 'TRADE'
  cardName: string
  price?: number
  condition: string
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  createdAt: string
  viewCount: number
}

export default function UserProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'transactions' | 'reviews' | 'listings'>('profile')

  const userId = params.id as string

  useEffect(() => {
    if (!userId) return

    const fetchUserProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const [profileResponse, transactionsResponse, reviewsResponse, listingsResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/transactions`),
          fetch(`/api/users/${userId}/reviews`),
          fetch(`/api/users/${userId}/listings`)
        ])

        if (!profileResponse.ok) {
          throw new Error('ユーザーが見つかりません')
        }

        const [profileResult, transactionsResult, reviewsResult, listingsResult] = await Promise.all([
          profileResponse.json(),
          transactionsResponse.json(),
          reviewsResponse.json(),
          listingsResponse.json()
        ])

        if (profileResult.success) {
          setProfile(profileResult.data)
        }
        if (transactionsResult.success) {
          setTransactions(transactionsResult.data)
        }
        if (reviewsResult.success) {
          setReviews(reviewsResult.data)
        }
        if (listingsResult.success) {
          setListings(listingsResult.data)
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price?: number) => {
    if (!price) return '価格応相談'
    return `¥${price.toLocaleString()}`
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'ACTIVE':
        return 'text-green-600 bg-green-50'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED':
      case 'EXPIRED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '完了'
      case 'PENDING': return '進行中'
      case 'CANCELLED': return 'キャンセル'
      case 'ACTIVE': return 'アクティブ'
      case 'EXPIRED': return '期限切れ'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SELL':
      case 'SALE':
        return 'text-red-600 bg-red-50'
      case 'BUY':
      case 'PURCHASE':
        return 'text-green-600 bg-green-50'
      case 'TRADE':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SELL':
      case 'SALE':
        return '売却'
      case 'BUY':
      case 'PURCHASE':
        return '購入'
      case 'TRADE':
        return '交換'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'ユーザーが見つかりません'}
            </h1>
            <Link 
              href="/cards" 
              className="text-indigo-600 hover:text-indigo-500"
            >
              カード検索に戻る
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                {profile.profileImageUrl ? (
                  <Image
                    src={profile.profileImageUrl}
                    alt={profile.username}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex">
                      {renderStars(profile.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({profile.reviewCount}件の評価)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    メンバー開始: {formatDate(profile.memberSince)}
                  </p>
                </div>
              </div>
              
              {profile.isCurrentUser && (
                <div className="mt-4 sm:mt-0">
                  <Link
                    href={`/profile/${profile.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    プロフィール編集
                  </Link>
                </div>
              )}
            </div>

            {profile.bio && (
              <div className="mt-4">
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            {/* 統計情報 */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">
                  {profile.stats.totalListings}
                </div>
                <div className="text-sm text-blue-700">総出品数</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">
                  {profile.stats.completedTransactions}
                </div>
                <div className="text-sm text-green-700">完了取引</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {profile.stats.activeListing}
                </div>
                <div className="text-sm text-purple-700">現在の出品</div>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                プロフィール
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                取引履歴 ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                評価・レビュー ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'listings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                出品履歴 ({listings.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* プロフィールタブ */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">ユーザー情報</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ユーザー名</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">評価</dt>
                    <dd className="mt-1 flex items-center space-x-1">
                      <div className="flex">
                        {renderStars(profile.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {profile.rating.toFixed(1)} ({profile.reviewCount}件)
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">メンバー開始</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(profile.memberSince)}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* 取引履歴タブ */}
            {activeTab === 'transactions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">取引履歴</h3>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">取引履歴がありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                              {getTypeText(transaction.type)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(transaction.completedAt)}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{transaction.cardName}</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            取引相手: 
                            <Link 
                              href={`/profile/${transaction.otherUser.id}`}
                              className="text-indigo-600 hover:text-indigo-500 font-medium ml-1"
                            >
                              {transaction.otherUser.username}
                            </Link>
                            <div className="flex items-center mt-1">
                              {renderStars(transaction.otherUser.rating)}
                            </div>
                          </div>
                          {transaction.price && (
                            <div className="text-lg font-semibold text-gray-900">
                              {formatPrice(transaction.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 評価・レビュータブ */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">受けた評価・レビュー</h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">レビューがありません</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {review.reviewerImage ? (
                              <Image
                                src={review.reviewerImage}
                                alt={review.reviewerName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {review.reviewerName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <Link 
                                href={`/profile/${review.reviewerId}`}
                                className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                              >
                                {review.reviewerName}
                              </Link>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(review.transactionType)}`}>
                                  {getTypeText(review.transactionType)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-900">対象カード: </span>
                          <span className="text-sm text-gray-700">{review.cardName}</span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 出品履歴タブ */}
            {activeTab === 'listings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">出品履歴</h3>
                {listings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">出品履歴がありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
                              {getTypeText(listing.type)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                              {getStatusText(listing.status)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(listing.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{listing.cardName}</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            状態: {listing.condition} • 閲覧数: {listing.viewCount}
                          </div>
                          {listing.price && (
                            <div className="text-lg font-semibold text-gray-900">
                              {formatPrice(listing.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}