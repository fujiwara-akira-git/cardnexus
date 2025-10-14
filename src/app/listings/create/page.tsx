'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CardSearch from '@/components/listings/CardSearch'

interface Card {
  id: string
  name: string
  gameTitle: string
  imageUrl?: string
  expansion?: string
  rarity?: string
}

interface ListingFormData {
  cardId: string
  listingType: 'SELL' | 'BUY' | 'TRADE'
  price?: number
  condition?: string
  description: string
}

export default function CreateListingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ListingFormData>({
    defaultValues: {
      listingType: 'SELL',
      condition: 'NEAR_MINT',
    }
  })

  const watchedListingType = watch('listingType')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, router])

  const onSubmit = async (data: ListingFormData) => {
    if (!selectedCard) {
      setError('カードを選択してください')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          cardId: selectedCard.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/listings/${result.data.id}`)
      } else {
        setError(result.error || '出品の作成に失敗しました')
      }
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const conditionOptions = [
    { value: 'MINT', label: '完美品 (MINT)' },
    { value: 'NEAR_MINT', label: '極美品 (NEAR MINT)' },
    { value: 'EXCELLENT', label: '美品 (EXCELLENT)' },
    { value: 'GOOD', label: '良品 (GOOD)' },
    { value: 'PLAYED', label: 'やや傷あり (PLAYED)' },
    { value: 'POOR', label: '傷あり (POOR)' },
  ]

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ログインが必要です
            </h1>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規出品</h1>
          <p className="mt-2 text-gray-600">
            カードを売る・買う・交換の出品を作成できます
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

              {/* カード選択 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  1. カードを選択
                </h3>
                <CardSearch 
                  onSelectCard={(card: Card | null) => {
                    setSelectedCard(card)
                    if (card) {
                      setValue('cardId', card.id)
                    }
                  }}
                  selectedCard={selectedCard}
                />
              </div>

              {/* 取引タイプ */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  2. 取引タイプを選択
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      value="SELL"
                      {...register('listingType', { required: '取引タイプを選択してください' })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      watchedListingType === 'SELL' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="font-medium text-gray-900">売ります</div>
                        <div className="text-sm text-gray-500 mt-1">
                          カードを販売します
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      value="BUY"
                      {...register('listingType', { required: '取引タイプを選択してください' })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      watchedListingType === 'BUY' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🛒</div>
                        <div className="font-medium text-gray-900">買います</div>
                        <div className="text-sm text-gray-500 mt-1">
                          カードを求めています
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      value="TRADE"
                      {...register('listingType', { required: '取引タイプを選択してください' })}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      watchedListingType === 'TRADE' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <div className="font-medium text-gray-900">交換</div>
                        <div className="text-sm text-gray-500 mt-1">
                          他のカードと交換
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.listingType && (
                  <p className="mt-1 text-sm text-red-600">{errors.listingType.message}</p>
                )}
              </div>

              {/* 価格設定（売り・買いの場合のみ） */}
              {(watchedListingType === 'SELL' || watchedListingType === 'BUY') && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    3. 価格設定
                  </h3>
                  <div className="max-w-xs">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      {watchedListingType === 'SELL' ? '販売価格' : '希望価格'} (円)
                    </label>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="100"
                      {...register('price', {
                        required: (watchedListingType === 'SELL' || watchedListingType === 'BUY') ? '価格を入力してください' : false,
                        min: {
                          value: 1,
                          message: '価格は1円以上で入力してください'
                        }
                      })}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="例: 5000"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* カード状態（売り・交換の場合のみ） */}
              {(watchedListingType === 'SELL' || watchedListingType === 'TRADE') && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    4. カードの状態
                  </h3>
                  <select
                    {...register('condition', {
                      required: (watchedListingType === 'SELL' || watchedListingType === 'TRADE') ? 'カードの状態を選択してください' : false
                    })}
                    className={`block w-full max-w-xs px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.condition ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">状態を選択</option>
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                  )}
                </div>
              )}

              {/* 詳細説明 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  5. 詳細説明
                </h3>
                <textarea
                  rows={5}
                  {...register('description', {
                    required: '詳細説明を入力してください',
                    minLength: {
                      value: 10,
                      message: '詳細説明は10文字以上で入力してください'
                    },
                    maxLength: {
                      value: 1000,
                      message: '詳細説明は1000文字以内で入力してください'
                    }
                  })}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={
                    watchedListingType === 'SELL' 
                      ? 'カードの詳細な状態、傷の有無、発送方法などを記載してください'
                      : watchedListingType === 'BUY'
                      ? '求めているカードの詳細、希望する状態などを記載してください'
                      : '交換を希望するカードの詳細、交換条件などを記載してください'
                  }
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* 送信ボタン */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedCard}
                    className="inline-flex justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        出品作成中...
                      </>
                    ) : (
                      '出品を作成'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}