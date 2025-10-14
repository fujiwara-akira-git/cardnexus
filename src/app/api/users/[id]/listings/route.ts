import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ユーザーの出品履歴取得
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

    // 出品履歴の取得
    const listings = await prisma.listing.findMany({
      where: { userId },
      include: {
        card: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            transactions: true, // 閲覧数の代わりに取引数で代用
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // データを変換
    const listingsData = listings.map(listing => ({
      id: listing.id,
      type: listing.listingType,
      cardName: listing.card.name,
      price: listing.price,
      condition: listing.condition || 'UNKNOWN',
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      viewCount: listing._count.transactions, // 実際の閲覧数APIが必要な場合は別途実装
    }))

    return NextResponse.json({
      success: true,
      data: listingsData,
    })

  } catch (error) {
    console.error('出品履歴取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}