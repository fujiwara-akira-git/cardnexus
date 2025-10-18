'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PriceChart } from '@/components/cards/PriceChart'
import { PriceStats } from '@/components/cards/PriceStats'
import { ActiveListings } from '@/components/cards/ActiveListings'
import { PriceHistory } from '@/components/cards/PriceHistory'

interface CardDetail {
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
  evolveFrom?: string
  evolveFromJa?: string
  artist?: string
  subtypes?: string
  subtypesJa?: string
  releaseDate?: string
  createdAt: string
  priceStats: {
    latest?: number
    average?: number
    min?: number
    max?: number
  }
  priceHistory: PriceHistoryItem[]
  activeListings: ActiveListing[]
}

interface PriceHistoryItem {
  id: string
  price: number
  source: string
  condition?: string
  recordedAt: string
}

interface ActiveListing {
  id: string
  type: 'SELL' | 'BUY' | 'TRADE'
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

export default function CardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [card, setCard] = useState<CardDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'history'>('overview')

  const cardId = params.id as string
  // URLから戻り先のURLを取得
  const returnUrl = searchParams.get('returnUrl') || '/cards'

  useEffect(() => {
    if (!cardId) return

    const fetchCardDetail = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/cards/${cardId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'カードの取得に失敗しました')
        }

        if (result.success) {
          setCard(result.data)
        } else {
          setError(result.error || 'カードが見つかりません')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ネットワークエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchCardDetail()
  }, [cardId])

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">カード詳細を読み込み中...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">カードが見つかりません</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <Link
                href={returnUrl}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                戻る
              </Link>
              <Link
                href="/cards"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                カード一覧へ
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link
            href={returnUrl}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            検索結果に戻る
          </Link>
        </div>

        {/* パンくずナビ */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ホーム
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link href="/cards" className="text-gray-500 hover:text-gray-700">
                カード検索
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {card.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* カード基本情報 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              {/* カード画像 */}
              <div className="aspect-w-3 aspect-h-4 mb-6">
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    width={300}
                    height={400}
                    className="w-full h-96 object-contain rounded-lg bg-white"
                    priority
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* カード基本情報 */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {card.nameJa || card.name}
                  </h1>
                  {card.nameJa && card.name !== card.nameJa && (
                    <p className="text-sm text-gray-500 mb-2">{card.name}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{card.gameTitle}</span>
                    {card.rarity && (
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        {card.rarity}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <dl className="space-y-2">
                    {card.cardNumber && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">カード番号:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.cardNumber}</dd>
                      </div>
                    )}
                    {(card.expansionJa || card.expansion) && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">拡張パック:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.expansionJa || card.expansion}</dd>
                      </div>
                    )}
                    {card.regulationMark && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">レギュレーション:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {card.regulationMark}
                          </span>
                        </dd>
                      </div>
                    )}
                    {(card.cardTypeJa || card.cardType) && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">カード種類:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.cardTypeJa || card.cardType}</dd>
                      </div>
                    )}
                    {card.hp && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">HP:</dt>
                        <dd className="text-sm font-medium text-red-600">{card.hp}</dd>
                      </div>
                    )}
                    {(card.typesJa || card.types) && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">タイプ:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.typesJa || card.types}</dd>
                      </div>
                    )}
                    {(card.evolveFromJa || card.evolveFrom) && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">進化元:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.evolveFromJa || card.evolveFrom}</dd>
                      </div>
                    )}
                    {card.artist && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">イラストレーター:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.artist}</dd>
                      </div>
                    )}
                    {card.releaseDate && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">発売日:</dt>
                        <dd className="text-sm font-medium text-gray-900">{card.releaseDate}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">登録日:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(card.createdAt)}</dd>
                    </div>
                  </dl>
                </div>

                {(card.effectTextJa || card.effectText) && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">効果テキスト</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {card.effectTextJa || card.effectText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* 価格統計 */}
            <PriceStats priceStats={card.priceStats} />

            {/* タブナビゲーション */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    価格チャート
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'listings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    出品情報 ({card.activeListings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    価格履歴 ({card.priceHistory.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <PriceChart priceHistory={card.priceHistory} />
                )}
                {activeTab === 'listings' && (
                  <ActiveListings listings={card.activeListings} />
                )}
                {activeTab === 'history' && (
                  <PriceHistory priceHistory={card.priceHistory} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}