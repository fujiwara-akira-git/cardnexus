import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// デッキ一覧取得・作成
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const gameTitle = searchParams.get('gameTitle')
    const format = searchParams.get('format')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const userId = searchParams.get('userId') // 特定ユーザーのデッキのみ取得

    const skip = (page - 1) * limit

    // 検索条件を構築
    const where: {
      isPublic?: boolean
      userId?: string
      gameTitle?: string
      format?: string
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }>
    } = {
      isPublic: true, // 公開デッキのみ（ユーザー指定時は除外）
    }

    if (userId) {
      // 特定ユーザーのデッキの場合は非公開も含める
      where.userId = userId
      delete where.isPublic
    }

    if (gameTitle) {
      where.gameTitle = gameTitle
    }

    if (format) {
      where.format = format
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // ソート条件
    let orderBy: Record<string, 'asc' | 'desc'> = {}
    if (sortBy === 'popularity') {
      orderBy = { likeCount: sortOrder as 'asc' | 'desc' }
    } else if (sortBy === 'views') {
      orderBy = { viewCount: sortOrder as 'asc' | 'desc' }
    } else {
      orderBy = { [sortBy]: sortOrder as 'asc' | 'desc' }
    }

    // デッキ取得
    const [decks, total] = await Promise.all([
      prisma.deck.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImageUrl: true,
            },
          },
          deckCards: {
            include: {
              card: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  rarity: true,
                },
              },
            },
          },
          deckTags: true,
          _count: {
            select: {
              deckLikes: true,
              deckCards: true,
            },
          },
        },
      }),
      prisma.deck.count({ where }),
    ])

    // レスポンス用に整形
    const formattedDecks = decks.map(deck => ({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      gameTitle: deck.gameTitle,
      format: deck.format,
      isPublic: deck.isPublic,
      likeCount: deck.likeCount,
      viewCount: deck.viewCount,
      coverImageUrl: deck.coverImageUrl,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
      user: deck.user,
      cardCount: deck._count.deckCards,
      totalLikes: deck._count.deckLikes,
      tags: deck.deckTags.map(tag => tag.tagName),
      // デッキのメインカード（最初の4枚）を表示用に取得
      sampleCards: deck.deckCards.slice(0, 4).map(dc => ({
        ...dc.card,
        quantity: dc.quantity,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: {
        decks: formattedDecks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error('デッキ取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'デッキの取得に失敗しました',
          details: error instanceof Error ? error.message : '不明なエラー',
        },
      },
      { status: 500 }
    )
  }
}

// デッキ作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '認証が必要です' },
        },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'ユーザーが見つかりません' },
        },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, gameTitle, format, isPublic, cards, tags } = body

    // バリデーション
    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'デッキ名は必須です' },
        },
        { status: 400 }
      )
    }

    if (!gameTitle?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'ゲームタイトルは必須です' },
        },
        { status: 400 }
      )
    }

    // トランザクションでデッキとカード、タグを作成
    const deck = await prisma.$transaction(async (tx) => {
      // デッキ作成
      const newDeck = await tx.deck.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          gameTitle: gameTitle.trim(),
          format: format?.trim(),
          isPublic: isPublic || false,
          userId: user.id,
        },
      })

      // カードをデッキに追加
      if (cards && Array.isArray(cards) && cards.length > 0) {
        const deckCards = cards.map((card: { cardId: string; quantity?: number }) => ({
          deckId: newDeck.id,
          cardId: card.cardId,
          quantity: card.quantity || 1,
        }))

        await tx.deckCard.createMany({
          data: deckCards,
        })
      }

      // タグを追加
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const deckTags = tags.map((tag: string) => ({
          deckId: newDeck.id,
          tagName: tag.trim(),
        }))

        await tx.deckTag.createMany({
          data: deckTags,
        })
      }

      return newDeck
    })

    return NextResponse.json({
      success: true,
      data: {
        deckId: deck.id,
        message: 'デッキが作成されました',
      },
    })
  } catch (error) {
    console.error('デッキ作成エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'デッキの作成に失敗しました',
          details: error instanceof Error ? error.message : '不明なエラー',
        },
      },
      { status: 500 }
    )
  }
}