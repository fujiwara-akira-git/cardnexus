'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type GameType = 'ポケモンカード' | '遊戯王'

interface GameSelectorProps {
  currentGame: GameType
  onGameChange?: (game: GameType) => void
}

export default function GameSelector({ currentGame, onGameChange }: GameSelectorProps) {
  const router = useRouter()
  const [selectedGame, setSelectedGame] = useState<GameType>(currentGame)

  const games: { type: GameType; icon: string; color: string; description: string }[] = [
    {
      type: 'ポケモンカード',
      icon: '⚡',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Pokemon TCG',
    },
    {
      type: '遊戯王',
      icon: '🎴',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Yu-Gi-Oh! OCG',
    },
  ]

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType)
    
    if (onGameChange) {
      onGameChange(gameType)
    } else {
      // デフォルトはカード検索ページにリダイレクト
      router.push(`/cards?game=${encodeURIComponent(gameType)}`)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
      {games.map((game) => (
        <button
          key={game.type}
          onClick={() => handleGameSelect(game.type)}
          className={`
            relative flex flex-col items-center justify-center
            p-6 rounded-lg transition-all duration-200
            ${selectedGame === game.type
              ? `${game.color} text-white shadow-lg scale-105 ring-4 ring-opacity-50 ring-white`
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow hover:shadow-md'
            }
          `}
        >
          {/* アイコン */}
          <div className="text-4xl mb-2">{game.icon}</div>
          
          {/* ゲームタイトル */}
          <div className="font-bold text-lg mb-1">{game.type}</div>
          
          {/* 英語表記 */}
          <div className={`text-sm ${selectedGame === game.type ? 'text-white/80' : 'text-gray-500'}`}>
            {game.description}
          </div>

          {/* 選択インジケーター */}
          {selectedGame === game.type && (
            <div className="absolute top-2 right-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
