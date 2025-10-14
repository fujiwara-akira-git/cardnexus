'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ProfileFormData {
  username: string
  bio: string
  profileImageUrl: string
}

interface UserProfile {
  id: string
  username: string
  email: string
  profileImageUrl?: string
  bio?: string
  rating: number
  reviewCount: number
  memberSince: string
}

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const userId = params.id as string

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileFormData>()

  const watchedImageUrl = watch('profileImageUrl')

  useEffect(() => {
    if (!userId || !session) return

    // 自分のプロフィールかチェック
    if (session.user?.id !== userId) {
      router.push(`/profile/${userId}`)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        const result = await response.json()

        if (result.success) {
          const profileData = result.data
          setProfile(profileData)
          
          // フォームに既存データを設定
          setValue('username', profileData.username)
          setValue('bio', profileData.bio || '')
          setValue('profileImageUrl', profileData.profileImageUrl || '')
          setImagePreview(profileData.profileImageUrl || '')
        } else {
          setError('プロフィール情報の取得に失敗しました')
        }
      } catch {
        setError('データの取得中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, session, setValue, router])

  useEffect(() => {
    if (watchedImageUrl) {
      setImagePreview(watchedImageUrl)
    }
  }, [watchedImageUrl])

  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/profile/${userId}`)
      } else {
        setError(result.error || 'プロフィールの更新に失敗しました')
      }
    } catch {
      setError('更新中にエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const clearImage = () => {
    setValue('profileImageUrl', '')
    setImagePreview('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              アクセスが許可されていません
            </h1>
            <p className="text-gray-600 mb-4">
              このページを表示するにはログインが必要です
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール編集</h1>
          <p className="mt-2 text-gray-600">
            あなたの基本情報を編集できます
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ユーザー名 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名 *
                </label>
                <input
                  type="text"
                  id="username"
                  {...register('username', {
                    required: 'ユーザー名は必須です',
                    minLength: {
                      value: 3,
                      message: 'ユーザー名は3文字以上で入力してください'
                    },
                    maxLength: {
                      value: 20,
                      message: 'ユーザー名は20文字以内で入力してください'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます'
                    }
                  })}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="ユーザー名を入力"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* プロフィール画像 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プロフィール画像
                </label>
                
                {/* 画像プレビュー */}
                <div className="flex items-center space-x-4 mb-4">
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="プロフィール画像プレビュー"
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                        onError={() => setImagePreview('')}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-700">
                        {profile.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* 画像URL入力 */}
                <div>
                  <input
                    type="url"
                    {...register('profileImageUrl', {
                      pattern: {
                        value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                        message: '有効な画像URLを入力してください（jpg, png, gif, webp）'
                      }
                    })}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.profileImageUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="画像のURLを入力（https://...）"
                  />
                  {errors.profileImageUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.profileImageUrl.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    外部の画像URLを指定してください（jpg, png, gif, webp形式）
                  </p>
                </div>
              </div>

              {/* 自己紹介 */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                <textarea
                  id="bio"
                  rows={5}
                  {...register('bio', {
                    maxLength: {
                      value: 500,
                      message: '自己紹介は500文字以内で入力してください'
                    }
                  })}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.bio ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="あなたについて教えてください..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  趣味、好きなカードゲーム、取引に関する方針などを自由に記載してください
                </p>
              </div>

              {/* ボタン */}
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      更新中...
                    </>
                  ) : (
                    '更新'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}