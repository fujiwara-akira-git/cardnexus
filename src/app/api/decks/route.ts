import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as dotenv from 'dotenv'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// .env.localを明示的に読み込み
dotenv.config({ path: process.cwd() + '/.env.local' })

// デッキ一覧取得
export async function GET(request: NextRequest) {
  try {
    console.log('=== SIMPLE DECKS API ===');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50));

    // シンプルにデッキ数を取得
    const total = await prisma.deck.count();
    console.log('Total decks found:', total);

    // デッキデータを取得（最初の5件）
    const decks = await prisma.deck.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
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
    });

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
      sampleCards: [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        decks: formattedDecks,
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(total / 12),
          totalItems: total,
          hasNext: total > 5,
          hasPrev: false,
        },
      },
      debug: {
        total: total,
        decksReturned: formattedDecks.length,
        databaseUrl: process.env.DATABASE_URL?.substring(0, 50)
      }
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

// デッキ作成（既存のPOSTメソッドを保持）
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
