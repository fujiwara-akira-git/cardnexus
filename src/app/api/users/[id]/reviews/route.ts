import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ユーザーが受けたレビューの取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // ユーザーが受けたレビューを取得
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        transaction: {
          include: {
            listing: {
              include: {
                card: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            buyer: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // データを変換
    const reviewsData = reviews.map(review => {
      // 取引タイプを判定（レビュー対象者が購入者か販売者か）
      const transactionType = review.transaction.buyer.id === userId ? 'PURCHASE' : 'SALE'

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewerId: review.reviewer.id,
        reviewerName: review.reviewer.username,
        reviewerImage: review.reviewer.profileImageUrl,
        transactionType,
        cardName: review.transaction.listing.card.name,
        createdAt: review.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: reviewsData,
    })

  } catch (error) {
    console.error('レビュー取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}