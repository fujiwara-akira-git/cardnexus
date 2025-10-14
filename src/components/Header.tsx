'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { GiCardPlay } from 'react-icons/gi'
import { NotificationCenter } from './dashboard/NotificationCenter'

export default function Header() {
  const { data: session, status } = useSession()

  // モック通知データ
  const notifications = [
    {
      id: '1',
      title: '新しいメッセージ',
      message: 'ピカチュウVMAXについて質問が届きました',
      type: 'info' as const,
      timestamp: '5分前',
      read: false
    },
    {
      id: '2',
      title: '出品が閲覧されました',
      message: 'リザードンEXが3回閲覧されました',
      type: 'success' as const,
      timestamp: '1時間前',
      read: false
    }
  ]
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <GiCardPlay className="text-3xl text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Card Nexus</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/#features" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              機能
            </Link>
            <Link 
              href="/cards" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              カード検索
            </Link>
            <Link 
              href="/listings" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              出品・求購
            </Link>
            <Link 
              href="/marketplace" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              マーケット
            </Link>
            <Link 
              href="/decks" 
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              デッキ
            </Link>
          </nav>

          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : session ? (
              <>
                <NotificationCenter notifications={notifications} />
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  ダッシュボード
                </Link>
                <Link 
                  href={`/profile/${session.user?.id}`}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  プロフィール
                </Link>
                <span className="text-gray-700 font-medium">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                >
                  ログイン
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button (TODO: Implement mobile menu) */}
          <div className="md:hidden">
            <button 
              className="text-gray-700 hover:text-indigo-600 transition-colors"
              aria-label="メニューを開く"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}