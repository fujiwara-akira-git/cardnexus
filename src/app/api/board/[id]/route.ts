import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// 投稿詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 投稿詳細取得
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
            rating: true,
            ratingCount: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            gameTitle: true,
            expansion: true,
            rarity: true,
          },
        },
        comments: {
          where: {
            parentId: null, // トップレベルコメントのみ
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profileImageUrl: true,
              },
            },
            replies: {
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
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
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

    // 閲覧数を増加（同期的に処理、エラーは無視）
    prisma.post
      .update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
      .catch(() => {
        // 閲覧数更新のエラーは無視
      })

    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        tags: post.tags,
        viewCount: post.viewCount + 1, // 増加分を反映
        likeCount: post.likeCount,
        isPinned: post.isPinned,
        isLocked: post.isLocked,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: post.author,
        card: post.card,
        comments: post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          likeCount: comment.likeCount,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          author: comment.author,
          totalLikes: comment._count.likes,
          replyCount: comment._count.replies,
          replies: comment.replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            likeCount: reply.likeCount,
            createdAt: reply.createdAt.toISOString(),
            updatedAt: reply.updatedAt.toISOString(),
            author: reply.author,
            totalLikes: reply._count.likes,
          })),
        })),
        totalComments: post._count.comments,
        totalLikes: post._count.likes,
      },
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '投稿の取得に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}

// 投稿更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params
    const body = await request.json()
    const { title, content, category, tags, cardId } = body

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

    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!existingPost) {
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

    if (existingPost.authorId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: '投稿を編集する権限がありません',
          },
        },
        { status: 403 }
      )
    }

    // バリデーション
    if (!title || !content || !category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'タイトル、内容、カテゴリは必須です',
          },
        },
        { status: 400 }
      )
    }

    // 投稿更新
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
        cardId: cardId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profileImageUrl: true,
          },
        },
        card: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        category: updatedPost.category,
        tags: updatedPost.tags,
        viewCount: updatedPost.viewCount,
        likeCount: updatedPost.likeCount,
        isPinned: updatedPost.isPinned,
        isLocked: updatedPost.isLocked,
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
        author: updatedPost.author,
        card: updatedPost.card,
      },
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '投稿の更新に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}

// 投稿削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params

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

    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    })

    if (!existingPost) {
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

    if (existingPost.authorId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: '投稿を削除する権限がありません',
          },
        },
        { status: 403 }
      )
    }

    // 投稿削除（CASCADE設定によりコメントも自動削除）
    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: '投稿が削除されました',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '投稿の削除に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}