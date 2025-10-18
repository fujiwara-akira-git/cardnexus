'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  HeartIcon,
  EyeIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

interface User {
  id: string
  username: string
  profileImageUrl: string | null
  rating: number | null
  ratingCount: number
}

interface Card {
  id: string
  name: string
  imageUrl: string | null
  rarity: string | null
  gameTitle: string
  expansion: string | null
  cardNumber: string | null
  effectText: string | null
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
  cards: Record<string, Card[]>
  statistics: {
    totalCards: number
    uniqueCards: number
    averageCardCost: number
  }
  tags: string[]
  likes: Array<{
    userId: string
    username: string
  }>
  totalLikes: number
  isLikedByCurrentUser: boolean
}

export default function DeckDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likesLoading, setLikesLoading] = useState(false)

  const deckId = params?.id as string

  const fetchDeck = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/decks/${deckId}`)
      const result = await response.json()

      if (result.success) {
        setDeck(result.data)
      } else {
        throw new Error(result.error?.message || 'デッキの取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching deck:', error)
      setError(error instanceof Error ? error.message : 'デッキの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    if (deckId) {
      fetchDeck()
    }
  }, [deckId, fetchDeck])

  const handleLike = async () => {
    if (!session) {
      alert('いいねするにはログインが必要です')
      return
    }

    if (!deck) return

    try {
      setLikesLoading(true)
      const response = await fetch(`/api/decks/${deckId}/like`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        // デッキ情報を更新
        setDeck(prev => prev ? {
          ...prev,
          isLikedByCurrentUser: result.data.isLiked,
          totalLikes: result.data.likeCount,
          likeCount: result.data.likeCount,
        } : null)
      } else {
        throw new Error(result.error?.message || 'いいね処理に失敗しました')
      }
    } catch (error) {
      console.error('Error liking deck:', error)
      alert(error instanceof Error ? error.message : 'いいね処理に失敗しました')
    } finally {
      setLikesLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deck?.name || 'デッキ',
          text: deck?.description || '',
          url: window.location.href,
        })
      } catch {
        // ユーザーがキャンセルした場合など
      }
    } else {
      // フォールバック：クリップボードにコピー
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('URLをクリップボードにコピーしました')
      } catch {
        alert('URLのコピーに失敗しました')
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || 'デッキが見つかりません'}</p>
            <Link href="/decks" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              デッキ一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.email && deck.user.id === session.user.id
  const cardTypes = Object.keys(deck.cards)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li><Link href="/decks" className="hover:text-blue-600">デッキ</Link></li>
            <li>/</li>
            <li className="text-gray-900">{deck.name}</li>
          </ol>
        </nav>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          {/* ヘッダー部分 */}
          <div className="relative">
            {/* カバー画像エリア */}
            <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg relative">
              {deck.coverImageUrl ? (
                <Image
                  src={deck.coverImageUrl}
                  alt={deck.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <ChartBarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium opacity-75">Deck Preview</p>
                  </div>
                </div>
              )}
              
              {/* アクションボタン */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                {isOwner && (
                  <>
                    <Link
                      href={`/decks/${deckId}/edit`}
                      className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button className="p-2 bg-red-600 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* フォーマットバッジ */}
              {deck.format && (
                <div className="absolute bottom-4 right-4">
                  <span className="bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                    {deck.format}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* タイトルと基本情報 */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{deck.name}</h1>
                  <p className="text-lg text-blue-600 mb-2">{deck.gameTitle}</p>
                  {deck.description && (
                    <p className="text-gray-600 mb-4">{deck.description}</p>
                  )}
                </div>
              </div>

              {/* 作成者情報 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <Link href={`/profile/${deck.user.username}`}>
                  <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    {deck.user.profileImageUrl ? (
                      <Image
                        src={deck.user.profileImageUrl}
                        alt={deck.user.username}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{deck.user.username}</p>
                      <div className="flex items-center space-x-1">
                        {deck.user.rating && (
                          <>
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {deck.user.rating.toFixed(1)} ({deck.user.ratingCount}件)
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(deck.createdAt)}</p>
                    </div>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    disabled={likesLoading}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {deck.isLikedByCurrentUser ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="text-sm font-medium">{deck.totalLikes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1 text-gray-500">
                    <EyeIcon className="h-5 w-5" />
                    <span className="text-sm">{deck.viewCount}</span>
                  </div>
                </div>
              </div>

              {/* タグ */}
              {deck.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {deck.tags.map((tag, index) => (
                      <span key={index} className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 統計情報 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{deck.statistics.totalCards}</div>
                  <div className="text-sm text-gray-600">合計枚数</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{deck.statistics.uniqueCards}</div>
                  <div className="text-sm text-gray-600">種類数</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{cardTypes.length}</div>
                  <div className="text-sm text-gray-600">タイプ数</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* デッキリスト */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              デッキリスト ({deck.statistics.totalCards}枚)
            </h2>
          </div>

          <div className="p-6">
            {cardTypes.length > 0 ? (
              <div className="space-y-8">
                {cardTypes.map((cardType) => {
                  const cards = deck.cards[cardType]
                  const typeTotal = cards.reduce((sum, card) => sum + card.quantity, 0)
                  
                  return (
                    <div key={cardType}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        {cardType} ({typeTotal}枚)
                      </h3>
                      <div className="grid gap-4">
                        {cards.map((card) => (
                          <Link key={card.id} href={`/cards/${card.id}`}>
                            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                              <div className="w-16 h-22 relative flex-shrink-0">
                                {card.imageUrl ? (
                                  <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-500">No Image</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{card.name}</h4>
                                    {card.expansion && (
                                      <p className="text-sm text-gray-600">{card.expansion}</p>
                                    )}
                                    {card.rarity && (
                                      <p className="text-sm text-gray-500">{card.rarity}</p>
                                    )}
                                    {card.cardNumber && (
                                      <p className="text-xs text-gray-400">#{card.cardNumber}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-blue-600">
                                      {card.quantity}×
                                    </span>
                                  </div>
                                </div>
                                
                                {card.effectText && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {card.effectText}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>デッキにカードが登録されていません</p>
              </div>
            )}
          </div>
        </div>

        {/* いいねしたユーザー */}
        {deck.likes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              いいねしたユーザー ({deck.totalLikes})
            </h2>
            <div className="flex flex-wrap gap-2">
              {deck.likes.slice(0, 10).map((like) => (
                <Link key={like.userId} href={`/profile/${like.username}`}>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                    {like.username}
                  </span>
                </Link>
              ))}
              {deck.likes.length > 10 && (
                <span className="inline-block px-3 py-1 text-gray-500 text-sm">
                  他{deck.likes.length - 10}名
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}