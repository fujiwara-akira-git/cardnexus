import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createSampleComments = async () => {
  try {
    // ユーザーと投稿を取得
    const user = await prisma.user.findFirst()
    const posts = await prisma.post.findMany()
    
    if (!user || posts.length === 0) {
      console.log('ユーザーまたは投稿が見つかりません。')
      return
    }

    // 各投稿にサンプルコメントを追加
    for (const post of posts) {
      await prisma.comment.create({
        data: {
          content: `「${post.title}」について、とても参考になりました！私も同じような経験があります。`,
          postId: post.id,
          authorId: user.id,
        }
      })

      // 一部の投稿には追加コメントも作成
      if (post.category === 'QUESTION') {
        await prisma.comment.create({
          data: {
            content: '私の場合は相場サイトで確認しています。最近の価格動向も見ておくと良いかもしれません。',
            postId: post.id,
            authorId: user.id,
          }
        })
      }

      if (post.category === 'DECK') {
        await prisma.comment.create({
          data: {
            content: 'エネルギーサーチャーを増やしてみてはいかがでしょうか？安定性が向上すると思います。',
            postId: post.id,
            authorId: user.id,
          }
        })
      }
    }

    console.log('サンプルコメントを作成しました！')
  } catch (error) {
    console.error('サンプルコメントの作成に失敗しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 直接実行する場合
if (require.main === module) {
  createSampleComments()
}