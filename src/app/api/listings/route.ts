import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// 出品作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cardId, listingType, price, condition, description } = body

    // バリデーション
    if (!cardId || !listingType || !description) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      )
    }

    if (!['SELL', 'BUY', 'TRADE'].includes(listingType)) {
      return NextResponse.json(
        { success: false, error: '無効な取引タイプです' },
        { status: 400 }
      )
    }

    // 価格のバリデーション（売り・買いの場合）
    if ((listingType === 'SELL' || listingType === 'BUY') && (!price || price <= 0)) {
      return NextResponse.json(
        { success: false, error: '価格を正しく入力してください' },
        { status: 400 }
      )
    }

    // コンディションのバリデーション（売り・交換の場合）
    if ((listingType === 'SELL' || listingType === 'TRADE') && !condition) {
      return NextResponse.json(
        { success: false, error: 'カードの状態を選択してください' },
        { status: 400 }
      )
    }

    // カードの存在確認
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    })

    if (!card) {
      return NextResponse.json(
        { success: false, error: '選択されたカードが見つかりません' },
        { status: 404 }
      )
    }

    // 出品作成
    const listing = await prisma.listing.create({
      data: {
        userId: session.user.id,
        cardId,
        listingType: listingType as 'SELL' | 'BUY' | 'TRADE',
        price: (listingType === 'SELL' || listingType === 'BUY') ? Math.floor(price) : null,
        condition: (listingType === 'SELL' || listingType === 'TRADE') ? condition : null,
        description: description.trim(),
        status: 'ACTIVE',
      },
      include: {
        card: {
          select: {
            id: true,
            name: true,
            gameTitle: true,
            imageUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: '出品が作成されました',
      data: listing,
    })

  } catch (error) {
    console.error('出品作成エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 出品一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const type = searchParams.get('type') // SELL, BUY, TRADE
    const cardId = searchParams.get('cardId')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // フィルタ条件構築
    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
    }

    if (type && ['SELL', 'BUY', 'TRADE'].includes(type)) {
      where.listingType = type as 'SELL' | 'BUY' | 'TRADE'
    }

    if (cardId) {
      where.cardId = cardId
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        {
          card: {
            name: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ]
    }

    // 総数取得
    const totalCount = await prisma.listing.count({ where })

    // 出品一覧取得
    const listings = await prisma.listing.findMany({
      where,
      include: {
        card: {
          select: {
            id: true,
            name: true,
            gameTitle: true,
            imageUrl: true,
            expansion: true,
            rarity: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            rating: true,
            ratingCount: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: listings.map(listing => ({
        id: listing.id,
        listingType: listing.listingType,
        price: listing.price,
        condition: listing.condition,
        description: listing.description,
        status: listing.status,
        createdAt: listing.createdAt.toISOString(),
        card: listing.card,
        user: {
          id: listing.user.id,
          username: listing.user.username,
          rating: listing.user.rating,
          reviewCount: listing.user.ratingCount,
          profileImage: listing.user.profileImageUrl,
        },
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })

  } catch (error) {
    console.error('出品一覧取得エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}