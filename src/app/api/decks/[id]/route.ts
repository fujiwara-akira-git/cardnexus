import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// デッキ内のカードの共通インターフェース
interface DeckCardItem {
  id: string
  name: string
  gameTitle: string
  imageUrl: string | null
  rarity: string | null
  cardNumber: string | null
  expansion: string | null
  effectText: string | null
  quantity: number
}

// 個別デッキ取得
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const deckId = params.id

    // デッキ取得（詳細情報含む）
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
            rating: true,
            ratingCount: true,
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
                gameTitle: true,
                expansion: true,
                cardNumber: true,
                effectText: true,
              },
            },
          },
          orderBy: {
            card: {
              name: 'asc',
            },
          },
        },
        deckUnregisteredCards: {
          include: {
            unregisteredCard: {
              select: {
                id: true,
                name: true,
                gameTitle: true,
                cardNumber: true,
                expansion: true,
              },
            },
          },
        },
        deckTags: {
          select: {
            tagName: true,
          },
        },
        deckLikes: {
          select: {
            userId: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    })

    if (!deck) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'デッキが見つかりません' },
        },
        { status: 404 }
      )
    }

    // 非公開デッキの場合は作成者以外アクセス不可
    const session = await getServerSession(authOptions)
    if (!deck.isPublic) {
      if (!session?.user?.email) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'このデッキにアクセスする権限がありません' },
          },
          { status: 403 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user || user.id !== deck.userId) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'このデッキにアクセスする権限がありません' },
          },
          { status: 403 }
        )
      }
    }

    // 閲覧数を増やす（作成者以外の場合）
    const viewerUser = session?.user?.email ? await prisma.user.findUnique({
      where: { email: session.user.email },
    }) : null

    if (!viewerUser || viewerUser.id !== deck.userId) {
      await prisma.deck.update({
        where: { id: deckId },
        data: { viewCount: { increment: 1 } },
      })
    }

    // カードをタイプ別に分類（登録済みカードと未登録カード両方）
    const cardsByType = deck.deckCards.reduce((acc, deckCard) => {
      const cardType = getCardType(deckCard.card.name, deckCard.card.effectText)
      if (!acc[cardType]) {
        acc[cardType] = []
      }
      acc[cardType].push({
        ...deckCard.card,
        quantity: deckCard.quantity,
      })
      return acc
    }, {} as Record<string, DeckCardItem[]>)

    // 未登録カードも追加
    deck.deckUnregisteredCards.forEach(deckUnregisteredCard => {
      const cardType = getCardType(deckUnregisteredCard.unregisteredCard.name, null)
      if (!cardsByType[cardType]) {
        cardsByType[cardType] = []
      }
      cardsByType[cardType].push({
        ...deckUnregisteredCard.unregisteredCard,
        quantity: deckUnregisteredCard.quantity,
        imageUrl: null,
        rarity: null,
        effectText: null,
      })
    })

    // 統計情報を計算
    const totalCards = deck.deckCards.reduce((sum, dc) => sum + dc.quantity, 0)
    const uniqueCards = deck.deckCards.length

    const formattedDeck = {
      id: deck.id,
      name: deck.name,
      description: deck.description,
      gameTitle: deck.gameTitle,
      format: deck.format,
      isPublic: deck.isPublic,
      likeCount: deck.likeCount,
      viewCount: deck.viewCount + 1, // インクリメント後の値
      coverImageUrl: deck.coverImageUrl,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
      user: deck.user,
      cards: cardsByType,
      statistics: {
        totalCards,
        uniqueCards,
        averageCardCost: calculateAverageCost(deck.deckCards),
      },
      tags: deck.deckTags.map(tag => tag.tagName),
      likes: deck.deckLikes.map(like => ({
        userId: like.userId,
        username: like.user.username,
      })),
      totalLikes: deck.deckLikes.length,
      isLikedByCurrentUser: viewerUser ? deck.deckLikes.some(like => like.userId === viewerUser.id) : false,
    }

    return NextResponse.json({
      success: true,
      data: formattedDeck,
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

// デッキ更新
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    const deckId = params.id
    const body = await request.json()
    const { name, description, format, isPublic, cards, tags } = body

    // デッキの存在確認と権限チェック
    const existingDeck = await prisma.deck.findUnique({
      where: { id: deckId },
    })

    if (!existingDeck) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'デッキが見つかりません' },
        },
        { status: 404 }
      )
    }

    if (existingDeck.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'このデッキを編集する権限がありません' },
        },
        { status: 403 }
      )
    }

    // トランザクションでデッキを更新
    const updatedDeck = await prisma.$transaction(async (tx) => {
      // デッキ基本情報を更新
      const deck = await tx.deck.update({
        where: { id: deckId },
        data: {
          name: name?.trim(),
          description: description?.trim(),
          format: format?.trim(),
          isPublic: isPublic,
          updatedAt: new Date(),
        },
      })

      // 既存のカードとタグを削除
      await tx.deckCard.deleteMany({
        where: { deckId },
      })
      await tx.deckTag.deleteMany({
        where: { deckId },
      })

      // 新しいカードを追加
      if (cards && Array.isArray(cards) && cards.length > 0) {
        const deckCards = cards.map((card: { cardId: string; quantity?: number }) => ({
          deckId: deckId,
          cardId: card.cardId,
          quantity: card.quantity || 1,
        }))

        await tx.deckCard.createMany({
          data: deckCards,
        })
      }

      // 新しいタグを追加
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const deckTags = tags.map((tag: string) => ({
          deckId: deckId,
          tagName: tag.trim(),
        }))

        await tx.deckTag.createMany({
          data: deckTags,
        })
      }

      return deck
    })

    return NextResponse.json({
      success: true,
      data: {
        deckId: updatedDeck.id,
        message: 'デッキが更新されました',
      },
    })
  } catch (error) {
    console.error('デッキ更新エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'デッキの更新に失敗しました',
          details: error instanceof Error ? error.message : '不明なエラー',
        },
      },
      { status: 500 }
    )
  }
}

// デッキ削除
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    const deckId = params.id

    // デッキの存在確認と権限チェック
    const existingDeck = await prisma.deck.findUnique({
      where: { id: deckId },
    })

    if (!existingDeck) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'デッキが見つかりません' },
        },
        { status: 404 }
      )
    }

    if (existingDeck.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'このデッキを削除する権限がありません' },
        },
        { status: 403 }
      )
    }

    // デッキを削除（関連データもカスケード削除される）
    await prisma.deck.delete({
      where: { id: deckId },
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'デッキが削除されました',
      },
    })
  } catch (error) {
    console.error('デッキ削除エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'デッキの削除に失敗しました',
          details: error instanceof Error ? error.message : '不明なエラー',
        },
      },
      { status: 500 }
    )
  }
}

// ヘルパー関数：カードタイプを判定
function getCardType(cardName: string, effectText?: string | null): string {
  const name = cardName.toLowerCase()
  const effect = effectText?.toLowerCase() || ''

  if (name.includes('エネルギー') || name.includes('energy')) {
    return 'エネルギー'
  }
  if (name.includes('トレーナー') || name.includes('trainer') || 
      effect.includes('サポート') || effect.includes('グッズ')) {
    return 'トレーナー'
  }
  if (name.includes('v') || name.includes('ex') || name.includes('gx')) {
    return '特殊ポケモン'
  }
  return 'ポケモン'
}

// ヘルパー関数：平均コストを計算（仮実装）
function calculateAverageCost(_deckCards: Array<{ quantity: number }>): number {
  // 実際の実装では、カードのコスト情報を元に計算
  return 2.5
}