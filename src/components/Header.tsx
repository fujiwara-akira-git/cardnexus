import Link from 'next/link'
import { GiCardPlay } from 'react-icons/gi'

export default function Header() {
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