'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Card {
  id: string
  name: string
  gameTitle: string
  imageUrl: string | null
  expansion: string | null
  rarity: string | null
}

const categories = [
  { value: 'GENERAL', label: '雑談' },
  { value: 'QUESTION', label: '質問' },
  { value: 'DECK', label: 'デッキ相談' },
  { value: 'TRADE', label: 'トレード' },
  { value: 'NEWS', label: 'ニュース' },
  { value: 'STRATEGY', label: '攻略・戦略' },
  { value: 'COLLECTION', label: 'コレクション' },
]

export default function CreatePostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    tags: [] as string[],
    cardId: '',
  })

  const [tagInput, setTagInput] = useState('')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [cardSearch, setCardSearch] = useState('')
  const [cardSearchResults, setCardSearchResults] = useState<Card[]>([])
  const [showCardSearch, setShowCardSearch] = useState(false)

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // カード検索
  useEffect(() => {
    if (cardSearch.length < 2) {
      setCardSearchResults([])
      return
    }

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/cards?search=${encodeURIComponent(cardSearch)}&limit=10`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setCardSearchResults(result.data)
          }
        }
      } catch (error) {
        console.error('カード検索エラー:', error)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [cardSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim()
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }))
        setTagInput('')
      }
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card)
    setFormData(prev => ({
      ...prev,
      cardId: card.id
    }))
    setShowCardSearch(false)
    setCardSearch('')
  }

  const handleCardRemove = () => {
    setSelectedCard(null)
    setFormData(prev => ({
      ...prev,
      cardId: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('タイトルと内容は必須です')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          tags: formData.tags,
          cardId: formData.cardId || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/board/${result.data.id}`)
      } else {
        throw new Error(result.error?.message || '投稿の作成に失敗しました')
      }
    } catch (error) {
      console.error('投稿作成エラー:', error)
      setError(error instanceof Error ? error.message : '投稿の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">新規投稿作成</h1>
            <p className="text-gray-600">カードゲームに関する情報を共有しましょう</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="投稿のタイトルを入力してください"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.title.length}/100文字
              </p>
            </div>

            {/* カテゴリー */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 関連カード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                関連カード（任意）
              </label>
              {selectedCard ? (
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-22 relative flex-shrink-0">
                    {selectedCard.imageUrl ? (
                      <Image
                        src={selectedCard.imageUrl}
                        alt={selectedCard.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedCard.name}</h3>
                    <p className="text-sm text-gray-600">{selectedCard.gameTitle}</p>
                    {selectedCard.expansion && (
                      <p className="text-sm text-gray-500">{selectedCard.expansion}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCardRemove}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCardSearch(!showCardSearch)}
                    className="w-full p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    クリックしてカードを検索・選択
                  </button>
                  
                  {showCardSearch && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <div className="relative mb-4">
                        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={cardSearch}
                          onChange={(e) => setCardSearch(e.target.value)}
                          className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="カード名で検索"
                        />
                      </div>
                      
                      {cardSearchResults.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {cardSearchResults.map((card) => (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => handleCardSelect(card)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg text-left"
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
                                    <span className="text-gray-400 text-xs">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{card.name}</h4>
                                <p className="text-sm text-gray-600">{card.gameTitle}</p>
                                {card.expansion && (
                                  <p className="text-sm text-gray-500">{card.expansion}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* タグ */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                タグ（任意）
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagAdd}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="タグを入力してEnterまたはカンマで追加"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 本文 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                maxLength={10000}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="投稿の内容を入力してください。マークダウン記法もご利用いただけます。"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length}/10,000文字
              </p>
            </div>

            {/* 送信ボタン */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '投稿中...' : '投稿する'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}