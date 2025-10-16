import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// デッキにいいねを付ける/外す
export async function POST(
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

    // デッキの存在確認
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
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

    // 既存のいいねを確認
    const existingLike = await prisma.deckLike.findUnique({
      where: {
        deckId_userId: {
          deckId,
          userId: user.id,
        },
      },
    })

    let isLiked: boolean
    let likeCount: number

    if (existingLike) {
      // いいねを削除
      await prisma.$transaction(async (tx) => {
        await tx.deckLike.delete({
          where: { id: existingLike.id },
        })
        await tx.deck.update({
          where: { id: deckId },
          data: { likeCount: { decrement: 1 } },
        })
      })
      isLiked = false
      likeCount = deck.likeCount - 1
    } else {
      // いいねを追加
      await prisma.$transaction(async (tx) => {
        await tx.deckLike.create({
          data: {
            deckId,
            userId: user.id,
          },
        })
        await tx.deck.update({
          where: { id: deckId },
          data: { likeCount: { increment: 1 } },
        })
      })
      isLiked = true
      likeCount = deck.likeCount + 1
    }

    return NextResponse.json({
      success: true,
      data: {
        isLiked,
        likeCount,
        message: isLiked ? 'いいねしました' : 'いいねを取り消しました',
      },
    })
  } catch (error) {
    console.error('いいね処理エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'いいね処理に失敗しました',
          details: error instanceof Error ? error.message : '不明なエラー',
        },
      },
      { status: 500 }
    )
  }
}