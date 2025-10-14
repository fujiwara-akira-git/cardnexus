'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Card {
  id: string
  name: string
  gameTitle: string
  imageUrl?: string
  expansion?: string
  rarity?: string
}

interface CardSearchProps {
  onSelectCard: (card: Card | null) => void
  selectedCard: Card | null
}

export default function CardSearch({ onSelectCard, selectedCard }: CardSearchProps) {
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // デバウンス処理
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.length >= 2) {
        searchCards(query)
      } else {
        setCards([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [query])

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchCards = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cards?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const result = await response.json()

      if (result.success) {
        setCards(result.data)
        setShowResults(true)
      } else {
        setCards([])
        setShowResults(false)
      }
    } catch (error) {
      console.error('カード検索エラー:', error)
      setCards([])
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCardSelect = (card: Card) => {
    onSelectCard(card)
    setQuery('')
    setShowResults(false)
  }

  const handleRemoveCard = () => {
    onSelectCard(null)
    setQuery('')
  }

  return (
    <div className="space-y-4">
      {/* 選択されたカード表示 */}
      {selectedCard && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            {selectedCard.imageUrl ? (
              <Image
                src={selectedCard.imageUrl}
                alt={selectedCard.name}
                width={80}
                height={60}
                className="rounded object-cover"
              />
            ) : (
              <div className="w-20 h-15 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">No Image</span>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{selectedCard.name}</h4>
              <p className="text-sm text-gray-600">{selectedCard.gameTitle}</p>
              {selectedCard.expansion && (
                <p className="text-sm text-gray-500">{selectedCard.expansion}</p>
              )}
              {selectedCard.rarity && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs mt-1">
                  {selectedCard.rarity}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemoveCard}
              className="text-red-600 hover:text-red-800 p-2"
              title="カード選択を解除"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* カード検索フォーム */}
      <div ref={searchRef} className="relative">
        <label htmlFor="card-search" className="block text-sm font-medium text-gray-700 mb-2">
          {selectedCard ? '別のカードを選択' : 'カードを検索'}
        </label>
        <div className="relative">
          <input
            id="card-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (cards.length > 0) {
                setShowResults(true)
              }
            }}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="カード名を入力してください（例: ピカチュウ）"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* 検索結果ドロップダウン */}
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {cards.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {loading ? '検索中...' : 'カードが見つかりませんでした'}
              </div>
            ) : (
              cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardSelect(card)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={40}
                        height={30}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-400">画像なし</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{card.name}</p>
                      <p className="text-sm text-gray-600 truncate">{card.gameTitle}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {card.expansion && (
                          <span className="text-xs text-gray-500 truncate">{card.expansion}</span>
                        )}
                        {card.rarity && (
                          <span className="inline-block px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {card.rarity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        カード名の一部を入力すると検索結果が表示されます
      </p>
    </div>
  )
}