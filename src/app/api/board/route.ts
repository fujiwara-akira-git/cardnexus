import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, PostCategory, Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// 掲示板投稿一覧取得・検索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // フィルタ条件構築
    const where: Prisma.PostWhereInput = {}

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      ]
    }

    if (category && ['GENERAL', 'QUESTION', 'DECK', 'TRADE', 'NEWS', 'STRATEGY', 'COLLECTION'].includes(category)) {
      where.category = category as PostCategory
    }

    if (tag) {
      where.tags = {
        has: tag,
      }
    }

    // ソート条件
    const orderBy: Prisma.PostOrderByWithRelationInput = {}
    if (sortBy === 'likeCount' || sortBy === 'viewCount' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'
    }

    // 投稿一覧取得
    const posts = await prisma.post.findMany({
      where,
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
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    })

    // 総件数取得
    const totalCount = await prisma.post.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
        category: post.category,
        tags: post.tags,
        viewCount: post.viewCount,
        likeCount: post.likeCount,
        isPinned: post.isPinned,
        isLocked: post.isLocked,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: post.author,
        card: post.card,
        commentCount: post._count.comments,
        totalLikes: post._count.likes,
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '投稿一覧の取得に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}

// 掲示板投稿作成
export async function POST(request: NextRequest) {
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

    // リクエストボディの解析
    const body = await request.json()
    const { title, content, category, tags, cardId } = body

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

    if (title.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'タイトルは100文字以内で入力してください',
          },
        },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '内容は10000文字以内で入力してください',
          },
        },
        { status: 400 }
      )
    }

    if (!['GENERAL', 'QUESTION', 'DECK', 'TRADE', 'NEWS', 'STRATEGY', 'COLLECTION'].includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '無効なカテゴリです',
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

    // カードIDの検証（提供された場合）
    if (cardId) {
      const card = await prisma.card.findUnique({
        where: { id: cardId },
      })

      if (!card) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CARD_NOT_FOUND',
              message: '指定されたカードが見つかりません',
            },
          },
          { status: 404 }
        )
      }
    }

    // 投稿作成
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category as PostCategory,
        tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
        authorId: user.id,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          viewCount: post.viewCount,
          likeCount: post.likeCount,
          isPinned: post.isPinned,
          isLocked: post.isLocked,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          author: post.author,
          card: post.card,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '投稿の作成に失敗しました',
        },
      },
      { status: 500 }
    )
  }
}