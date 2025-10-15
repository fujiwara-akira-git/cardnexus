'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  SaveIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface Card {
  id: string
  name: string
  imageUrl: string | null
  gameTitle: string
  expansion: string | null
  rarity: string | null
  cardNumber: string | null
  effectText: string | null
}

interface DeckCard {
  card: Card
  quantity: number
}

interface SearchResult {
  cards: Card[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const gameOptions = [
  { value: 'ポケモンカード', label: 'ポケモンカード' },
  { value: '遊戯王', label: '遊戯王' },
  { value: 'マジック:ザ・ギャザリング', label: 'MTG' },
  { value: 'デュエル・マスターズ', label: 'デュエマス' },
]

const formatOptions = [
  { value: 'スタンダード', label: 'スタンダード' },
  { value: 'エクスパンデッド', label: 'エクスパンデッド' },
  { value: 'アンリミテッド', label: 'アンリミテッド' },
]

export default function DeckBuilderPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // デッキ情報
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [selectedGame, setSelectedGame] = useState('ポケモンカード')
  const [selectedFormat, setSelectedFormat] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  
  // デッキ構成
  const [deckCards, setDeckCards] = useState<DeckCard[]>([])
  
  // カード検索
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  
  // 表示モード
  const [viewMode, setViewMode] = useState<'build' | 'preview'>('build')
  
  // 保存状態
  const [saving, setSaving] = useState(false)
  
  // 認証チェック
  useEffect(() => {
    if (session === null) {
      router.push('/auth/signin')
    }
  }, [session, router])

  // カード検索
  const searchCards = useCallback(async (page = 1) => {
    if (!searchTerm.trim()) {
      setSearchResults(null)
      return
    }
    
    try {
      setSearchLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        gameTitle: selectedGame,
        page: page.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/cards?${params}`)
      const result = await response.json()

      if (result.success) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error('カード検索エラー:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [searchTerm, selectedGame])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setSearchPage(1)
        searchCards(1)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedGame, searchCards])

  // カードをデッキに追加
  const addCardToDeck = (card: Card) => {
    const existingCard = deckCards.find(dc => dc.card.id === card.id)
    if (existingCard) {
      setDeckCards(prev => prev.map(dc => 
        dc.card.id === card.id 
          ? { ...dc, quantity: dc.quantity + 1 }
          : dc
      ))
    } else {
      setDeckCards(prev => [...prev, { card, quantity: 1 }])
    }
  }

  // カードの枚数を変更
  const updateCardQuantity = (cardId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCardFromDeck(cardId)
    } else {
      setDeckCards(prev => prev.map(dc => 
        dc.card.id === cardId 
          ? { ...dc, quantity: Math.min(newQuantity, 4) } // 最大4枚
          : dc
      ))
    }
  }

  // カードを削除
  const removeCardFromDeck = (cardId: string) => {
    setDeckCards(prev => prev.filter(dc => dc.card.id !== cardId))
  }

  // タグを追加
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  // デッキを保存
  const saveDeck = async () => {
    if (!deckName.trim()) {
      alert('デッキ名を入力してください')
      return
    }

    if (deckCards.length === 0) {
      alert('デッキにカードを追加してください')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: deckName.trim(),
          description: deckDescription.trim(),
          gameTitle: selectedGame,
          format: selectedFormat,
          isPublic,
          cards: deckCards.map(dc => ({
            cardId: dc.card.id,
            quantity: dc.quantity,
          })),
          tags,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/decks/${result.data.deckId}`)
      } else {
        throw new Error(result.error?.message || 'デッキの保存に失敗しました')
      }
    } catch (error) {
      console.error('デッキ保存エラー:', error)
      alert(error instanceof Error ? error.message : 'デッキの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // 統計情報
  const totalCards = deckCards.reduce((sum, dc) => sum + dc.quantity, 0)
  const uniqueCards = deckCards.length

  // カードタイプ別の分類
  const cardsByType = deckCards.reduce((acc, deckCard) => {
    const cardType = getCardType(deckCard.card.name, deckCard.card.effectText)
    if (!acc[cardType]) {
      acc[cardType] = []
    }
    acc[cardType].push(deckCard)
    return acc
  }, {} as Record<string, DeckCard[]>)

  if (session === null) {
    return <div>認証中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">デッキビルダー</h1>
            <p className="mt-2 text-gray-600">
              カードを検索してデッキを作成しよう
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'build' ? 'preview' : 'build')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {viewMode === 'build' ? 'プレビュー' : '編集モード'}
            </button>
            <button
              onClick={saveDeck}
              disabled={saving || !deckName.trim() || deckCards.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : 'デッキを保存'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：カード検索 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">カード検索</h2>
              
              {/* 検索フォーム */}
              <div className="space-y-4">
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
                    カード名
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="カード名で検索..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 検索結果 */}
              <div className="mt-6">
                {searchLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">検索中...</p>
                  </div>
                ) : searchResults && searchResults.cards.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.cards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => addCardToDeck(card)}
                      >
                        <div className="w-12 h-16 relative flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{card.name}</h4>
                          {card.expansion && (
                            <p className="text-sm text-gray-600">{card.expansion}</p>
                          )}
                          {card.rarity && (
                            <p className="text-xs text-gray-500">{card.rarity}</p>
                          )}
                        </div>
                        <PlusIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : searchTerm && !searchLoading ? (
                  <p className="text-center py-4 text-gray-500">カードが見つかりませんでした</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* 右側：デッキ編集エリア */}
          <div className="lg:col-span-2">
            {viewMode === 'build' ? (
              <div className="space-y-6">
                {/* デッキ基本情報 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">デッキ情報</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        デッキ名 *
                      </label>
                      <input
                        type="text"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        placeholder="デッキ名を入力..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={100}
                      />
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
                        <option value="">選択してください</option>
                        {formatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        説明
                      </label>
                      <textarea
                        value={deckDescription}
                        onChange={(e) => setDeckDescription(e.target.value)}
                        rows={3}
                        placeholder="デッキの戦術や特徴を説明..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={1000}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        公開設定
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          デッキを公開する
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        タグ
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          placeholder="タグを追加..."
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={addTag}
                          className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          追加
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              #{tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* デッキ統計 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">デッキ統計</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
                      <div className="text-sm text-gray-600">合計枚数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{uniqueCards}</div>
                      <div className="text-sm text-gray-600">種類数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Object.keys(cardsByType).length}
                      </div>
                      <div className="text-sm text-gray-600">タイプ数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {totalCards > 0 ? Math.round((totalCards / 60) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">デッキ完成度</div>
                    </div>
                  </div>
                </div>

                {/* デッキリスト */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    デッキリスト ({totalCards}枚)
                  </h2>
                  
                  {Object.keys(cardsByType).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(cardsByType).map(([type, cards]) => (
                        <div key={type}>
                          <h3 className="font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
                            {type} ({cards.reduce((sum, dc) => sum + dc.quantity, 0)}枚)
                          </h3>
                          <div className="space-y-2">
                            {cards.map((deckCard) => (
                              <div
                                key={deckCard.card.id}
                                className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md"
                              >
                                <div className="w-12 h-16 relative flex-shrink-0">
                                  {deckCard.card.imageUrl ? (
                                    <Image
                                      src={deckCard.card.imageUrl}
                                      alt={deckCard.card.name}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                      <span className="text-xs text-gray-500">No Image</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900">{deckCard.card.name}</h4>
                                  {deckCard.card.expansion && (
                                    <p className="text-sm text-gray-600">{deckCard.card.expansion}</p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateCardQuantity(deckCard.card.id, deckCard.quantity - 1)}
                                    className="p-1 text-gray-600 hover:text-red-600"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </button>
                                  <span className="w-8 text-center font-medium">{deckCard.quantity}</span>
                                  <button
                                    onClick={() => updateCardQuantity(deckCard.card.id, deckCard.quantity + 1)}
                                    className="p-1 text-gray-600 hover:text-blue-600"
                                    disabled={deckCard.quantity >= 4}
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => removeCardFromDeck(deckCard.card.id)}
                                    className="p-1 text-gray-600 hover:text-red-600"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>まだカードが追加されていません</p>
                      <p className="text-sm">左側からカードを検索して追加してください</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* プレビューモード */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{deckName || 'Untitled Deck'}</h2>
                {deckDescription && (
                  <p className="text-gray-600 mb-6">{deckDescription}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xl font-bold text-blue-600">{totalCards}</div>
                    <div className="text-sm text-gray-600">合計枚数</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xl font-bold text-green-600">{uniqueCards}</div>
                    <div className="text-sm text-gray-600">種類数</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xl font-bold text-purple-600">
                      {Object.keys(cardsByType).length}
                    </div>
                    <div className="text-sm text-gray-600">タイプ数</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xl font-bold text-orange-600">
                      {totalCards > 0 ? Math.round((totalCards / 60) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">完成度</div>
                  </div>
                </div>

                {Object.keys(cardsByType).length > 0 && (
                  <div className="space-y-4">
                    {Object.entries(cardsByType).map(([type, cards]) => (
                      <div key={type}>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {type} ({cards.reduce((sum, dc) => sum + dc.quantity, 0)}枚)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cards.map((deckCard) => (
                            <div key={deckCard.card.id} className="flex items-center space-x-2 text-sm">
                              <span className="font-medium w-6">{deckCard.quantity}×</span>
                              <span>{deckCard.card.name}</span>
                            </div>
                          ))}
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
    </div>
  )
}

// ヘルパー関数：カードタイプを判定
function getCardType(cardName: string, effectText?: string | null): string {
  const name = cardName.toLowerCase()
  const effect = effectText?.toLowerCase() || ''

  if (name.includes('エネルギー') || name.includes('energy')) {
    return 'エネルギー'
  }
  if (name.includes('トレーナー') || name.includes('trainer') || 
      effect.includes('サポート') || effect.includes('グッズ')) {
    return 'トレーナー'
  }
  if (name.includes('v') || name.includes('ex') || name.includes('gx')) {
    return '特殊ポケモン'
  }
  return 'ポケモン'
}