import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// コメント投稿
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      )
    }

    const params = await context.params
    const { id: postId } = params
    const body = await request.json()
    const { content, parentId } = body

    // バリデーション
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'コメント内容は必須です',
          },
        },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'コメントは2000文字以内で入力してください',
          },
        },
        { status: 400 }
      )
    }

    // ユーザー情報取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'ユーザーが見つかりません',
          },
        },
        { status: 404 }
      )
    }

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isLocked: true },
    })

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: '投稿が見つかりません',
          },
        },
        { status: 404 }
      )
    }

    if (post.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'POST_LOCKED',
            message: 'この投稿はコメントが禁止されています',
          },
        },
        { status: 403 }
      )
    }

    // 親コメントの存在確認（返信の場合）
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      })

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARENT_COMMENT_NOT_FOUND',
              message: '返信対象のコメントが見つかりません',
            },
          },
          { status: 404 }
        )
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PARENT_COMMENT',
              message: '返信対象のコメントが不正です',
            },
          },
          { status: 400 }
        )
      }
    }

    // コメント作成
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: comment.id,
          content: comment.content,
          likeCount: comment.likeCount,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          author: comment.author,
          parentId: comment.parentId,
          totalLikes: comment._count.likes,
          replyCount: comment._count.replies,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'コメントの投稿に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}