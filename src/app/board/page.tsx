'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  EyeIcon,
  PencilIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Author {
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
  gameTitle: string
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  viewCount: number
  likeCount: number
  isPinned: boolean
  isLocked: boolean
  createdAt: string
  updatedAt: string
  author: Author
  card: Card | null
  commentCount: number
  totalLikes: number
}

interface PostsResponse {
  success: boolean
  data: Post[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const categories = [
  { value: '', label: 'すべて' },
  { value: 'GENERAL', label: '雑談' },
  { value: 'QUESTION', label: '質問' },
  { value: 'DECK', label: 'デッキ相談' },
  { value: 'TRADE', label: 'トレード' },
  { value: 'NEWS', label: 'ニュース' },
  { value: 'STRATEGY', label: '攻略・戦略' },
  { value: 'COLLECTION', label: 'コレクション' },
]

const sortOptions = [
  { value: 'createdAt', label: '投稿日時' },
  { value: 'likeCount', label: 'いいね数' },
  { value: 'viewCount', label: '閲覧数' },
]

export default function BoardPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  
  // フィルター・検索状態
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    tag: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  useEffect(() => {
    fetchPosts()
  }, [page, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.tag && { tag: filters.tag }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      const response = await fetch(`/api/board?${params}`)
      const result: PostsResponse = await response.json()

      if (result.success) {
        setPosts(result.data)
        setTotalPages(result.pagination.totalPages)
      } else {
        throw new Error('投稿一覧の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('投稿一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPage(1)
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GENERAL': return 'bg-gray-100 text-gray-800'
      case 'QUESTION': return 'bg-blue-100 text-blue-800'
      case 'DECK': return 'bg-purple-100 text-purple-800'
      case 'TRADE': return 'bg-green-100 text-green-800'
      case 'NEWS': return 'bg-red-100 text-red-800'
      case 'STRATEGY': return 'bg-yellow-100 text-yellow-800'
      case 'COLLECTION': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP')
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">掲示板</h1>
            <p className="text-gray-600">カードゲーム情報交換・質問・雑談</p>
          </div>
          {session && (
            <Link
              href="/board/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
            >
              <PencilIcon className="h-5 w-5" />
              <span>投稿する</span>
            </Link>
          )}
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 検索 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キーワード検索
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="タイトルや内容で検索"
                  />
                </div>
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ソート */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  並び順
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 投稿一覧 */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* タイトルとカテゴリー */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {getCategoryLabel(post.category)}
                        </span>
                        {post.isPinned && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            📌 ピン留め
                          </span>
                        )}
                        {post.isLocked && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🔒 ロック済み
                          </span>
                        )}
                      </div>

                      <Link href={`/board/${post.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.content}
                      </p>

                      {/* タグ */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 統計と投稿者情報 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Link href={`/profile/${post.author.username}`}>
                            <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                              {post.author.profileImageUrl ? (
                                <Image
                                  src={post.author.profileImageUrl}
                                  alt={post.author.username}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                              )}
                              <span className="text-sm text-gray-700">{post.author.username}</span>
                            </div>
                          </Link>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <ClockIcon className="h-4 w-4" />
                            <span className="text-sm">{formatDate(post.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{post.viewCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            <span>{post.commentCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <HeartIcon className="h-4 w-4" />
                            <span>{post.totalLikes}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 関連カード */}
                    {post.card && (
                      <div className="ml-6 flex-shrink-0">
                        <Link href={`/cards/${post.card.id}`}>
                          <div className="w-16 h-22 relative">
                            {post.card.imageUrl ? (
                              <Image
                                src={post.card.imageUrl}
                                alt={post.card.name}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">投稿が見つかりませんでした</p>
            {session && (
              <Link
                href="/board/create"
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
              >
                最初の投稿を作成する
              </Link>
            )}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  前へ
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 border rounded-md ${
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  次へ
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}