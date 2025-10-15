'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  HeartIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

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
  expansion: string | null
  rarity: string | null
}

interface Comment {
  id: string
  content: string
  likeCount: number
  createdAt: string
  updatedAt: string
  author: Author
  totalLikes: number
  replyCount: number
  replies: Comment[]
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
  comments: Comment[]
  totalComments: number
  totalLikes: number
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

export default function PostDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [commentLoading, setCommentLoading] = useState(false)

  const postId = params?.id as string

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/board/${postId}`)
      const result = await response.json()

      if (result.success) {
        setPost(result.data)
      } else {
        throw new Error(result.error?.message || '投稿の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error instanceof Error ? error.message : '投稿の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentContent.trim()) return
    
    setCommentLoading(true)
    
    try {
      const response = await fetch(`/api/board/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent.trim(),
          parentId: replyTo,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCommentContent('')
        setReplyTo(null)
        await fetchPost() // 投稿を再取得してコメント一覧を更新
      } else {
        throw new Error(result.error?.message || 'コメントの投稿に失敗しました')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      alert(error instanceof Error ? error.message : 'コメントの投稿に失敗しました')
    } finally {
      setCommentLoading(false)
    }
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
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRelativeTime = (dateString: string) => {
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600">{error || '投稿が見つかりません'}</p>
            <Link href="/board" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              掲示板に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-6">
          <ol className="flex space-x-2 text-sm text-gray-500">
            <li><Link href="/board" className="hover:text-blue-600">掲示板</Link></li>
            <li>/</li>
            <li className="text-gray-900">{post.title}</li>
          </ol>
        </nav>

        {/* 投稿本体 */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
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
              
              {session?.user?.email && (
                <div className="flex items-center space-x-2">
                  {/* 編集・削除ボタンは投稿者のみ表示（実装省略） */}
                </div>
              )}
            </div>

            {/* タイトル */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* 投稿者情報 */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <Link href={`/profile/${post.author.username}`}>
                <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  {post.author.profileImageUrl ? (
                    <Image
                      src={post.author.profileImageUrl}
                      alt={post.author.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{post.author.username}</p>
                    <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>{post.totalComments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HeartIcon className="h-4 w-4" />
                  <span>{post.totalLikes}</span>
                </div>
              </div>
            </div>

            {/* 関連カード */}
            {post.card && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">関連カード</h3>
                <Link href={`/cards/${post.card.id}`}>
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-22 relative flex-shrink-0">
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
                    <div>
                      <h4 className="font-medium text-gray-900">{post.card.name}</h4>
                      <p className="text-sm text-gray-600">{post.card.gameTitle}</p>
                      {post.card.expansion && (
                        <p className="text-sm text-gray-500">{post.card.expansion} • {post.card.rarity}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* タグ */}
            {post.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 投稿内容 */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap break-words">{post.content}</div>
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              コメント ({post.totalComments})
            </h2>
          </div>

          {/* コメント投稿フォーム */}
          {session && !post.isLocked && (
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={replyTo ? '返信を入力してください...' : 'コメントを入力してください...'}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {commentContent.length}/2,000文字
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  {replyTo && (
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      返信をキャンセル
                    </button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                    <button
                      type="submit"
                      disabled={commentLoading || !commentContent.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {commentLoading ? '投稿中...' : '投稿'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* コメント一覧 */}
          <div className="divide-y divide-gray-200">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="p-6">
                  {/* コメントヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <Link href={`/profile/${comment.author.username}`}>
                      <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        {comment.author.profileImageUrl ? (
                          <Image
                            src={comment.author.profileImageUrl}
                            alt={comment.author.username}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{comment.author.username}</p>
                          <p className="text-sm text-gray-500">{formatRelativeTime(comment.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center space-x-2">
                      {session && (
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          返信
                        </button>
                      )}
                      <div className="flex items-center space-x-1 text-gray-500">
                        <HeartIcon className="h-4 w-4" />
                        <span className="text-sm">{comment.totalLikes}</span>
                      </div>
                    </div>
                  </div>

                  {/* コメント内容 */}
                  <div className="whitespace-pre-wrap break-words text-gray-900 mb-3">
                    {comment.content}
                  </div>

                  {/* 返信 */}
                  {comment.replies.length > 0 && (
                    <div className="ml-8 space-y-4 border-l-2 border-gray-100 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Link href={`/profile/${reply.author.username}`}>
                              <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                {reply.author.profileImageUrl ? (
                                  <Image
                                    src={reply.author.profileImageUrl}
                                    alt={reply.author.username}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{reply.author.username}</p>
                                  <p className="text-xs text-gray-500">{formatRelativeTime(reply.createdAt)}</p>
                                </div>
                              </div>
                            </Link>
                            
                            <div className="flex items-center space-x-1 text-gray-500">
                              <HeartIcon className="h-3 w-3" />
                              <span className="text-xs">{reply.totalLikes}</span>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap break-words text-sm text-gray-900">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                まだコメントがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}