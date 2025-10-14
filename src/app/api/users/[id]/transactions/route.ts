import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ユーザーの取引履歴取得
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

    // 取引履歴の取得（購入者として）
    const buyerTransactions = await prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        listing: {
          include: {
            card: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // 取引履歴の取得（販売者として）
    const sellerTransactions = await prisma.transaction.findMany({
      where: { sellerId: userId },
      include: {
        listing: {
          include: {
            card: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // データを統一形式に変換
    const transactions = [
      ...buyerTransactions.map(transaction => ({
        id: transaction.id,
        type: 'PURCHASE' as const,
        cardName: transaction.listing.card.name,
        price: transaction.price,
        status: transaction.status,
        completedAt: transaction.completedAt?.toISOString() || transaction.createdAt.toISOString(),
        otherUser: {
          id: transaction.seller.id,
          username: transaction.seller.username,
          rating: transaction.seller.rating,
        },
      })),
      ...sellerTransactions.map(transaction => ({
        id: transaction.id,
        type: 'SALE' as const,
        cardName: transaction.listing.card.name,
        price: transaction.price,
        status: transaction.status,
        completedAt: transaction.completedAt?.toISOString() || transaction.createdAt.toISOString(),
        otherUser: {
          id: transaction.buyer.id,
          username: transaction.buyer.username,
          rating: transaction.buyer.rating,
        },
      })),
    ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    return NextResponse.json({
      success: true,
      data: transactions,
    })

  } catch (error) {
    console.error('取引履歴取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}