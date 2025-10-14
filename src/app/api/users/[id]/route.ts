import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// ユーザープロフィール詳細の取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const session = await getServerSession(authOptions)

    // ユーザー情報の取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        profileImageUrl: true,
        bio: true,
        createdAt: true,
        // 評価の平均を計算
        reviews: {
          select: {
            rating: true,
          },
        },
        // 統計情報のための関連データ
        _count: {
          select: {
            listings: true,
            buyerTransactions: true,
            sellerTransactions: true,
          },
        },
        listings: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            id: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // 評価の計算
    const ratings = user.reviews.map((review: { rating: number }) => review.rating)
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
      : 0
    const reviewCount = ratings.length

    // 完了した取引数
    const completedTransactions = user._count.buyerTransactions + user._count.sellerTransactions

    // レスポンスデータの構築
    const profileData = {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      rating: Math.round(averageRating * 10) / 10, // 小数点1位まで
      reviewCount,
      memberSince: user.createdAt.toISOString(),
      isCurrentUser: session?.user?.id === userId,
      stats: {
        totalListings: user._count.listings,
        completedTransactions,
        activeListing: user.listings.length,
      },
    }

    return NextResponse.json({
      success: true,
      data: profileData,
    })

  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// プロフィール更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const session = await getServerSession(authOptions)

    // 認証チェック
    if (!session || session.user?.id !== userId) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, bio, profileImageUrl } = body

    // バリデーション
    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'ユーザー名は3文字以上で入力してください' },
        { status: 400 }
      )
    }

    if (username.length > 20) {
      return NextResponse.json(
        { success: false, error: 'ユーザー名は20文字以内で入力してください' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { success: false, error: 'ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます' },
        { status: 400 }
      )
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { success: false, error: '自己紹介は500文字以内で入力してください' },
        { status: 400 }
      )
    }

    // ユーザー名の重複チェック（自分以外）
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        NOT: {
          id: userId,
        },
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'このユーザー名は既に使用されています' },
        { status: 400 }
      )
    }

    // プロフィール更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username.trim(),
        bio: bio?.trim() || null,
        profileImageUrl: profileImageUrl?.trim() || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        profileImageUrl: true,
        bio: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'プロフィールが更新されました',
      data: updatedUser,
    })

  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}