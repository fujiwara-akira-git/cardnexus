import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createSamplePosts = async () => {
  try {
    // ユーザーIDを取得（最初のユーザーを使用）
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('ユーザーが見つかりません。まずユーザーを作成してください。')
      return
    }

    // カードIDを取得（最初のカードを使用）
    const card = await prisma.card.findFirst()

    // サンプル投稿データ
    const samplePosts = [
      {
        title: '【質問】ピカチュウVMAXの相場について',
        content: 'ピカチュウVMAXの現在の相場を教えてください。最近価格が上がっているようですが、買い時でしょうか？',
        category: 'QUESTION' as const,
        authorId: user.id,
        cardId: card?.id
      },
      {
        title: '【デッキ診断】雷タイプデッキの改良案求む',
        content: 'みなさんこんにちは！雷タイプデッキを使っているのですが、なかなか勝率が上がりません。アドバイスをいただけませんか？\n\n現在のデッキリスト：\n- ピカチュウV ×4\n- ピカチュウVMAX ×3\n- ライチュウGX ×2\n...',
        category: 'DECK' as const,
        authorId: user.id
      },
      {
        title: '【取引】ポケモンカード 旧裏面 コレクション整理',
        content: '旧裏面のポケモンカードコレクションを整理しています。リザードン、フシギダネなど多数あります。興味のある方はDMください。\n\n状態：美品〜極美品\n価格：応相談',
        category: 'TRADE' as const,
        authorId: user.id
      },
      {
        title: '【一般】新弾「クレイバースト」の注目カード',
        content: '新弾「クレイバースト」が発売されましたね！みなさんはどのカードに注目していますか？\n\n個人的にはナンジャモSARが話題になりそうだと思います。',
        category: 'GENERAL' as const,
        authorId: user.id
      },
      {
        title: '【ニュース】ポケモンカード公式大会開催決定',
        content: '来月、地域のポケモンカード公式大会が開催されることが決定しました！\n\n開催日：2024年2月15日\n場所：〇〇会館\n参加費：500円\n\n皆さん参加されますか？',
        category: 'NEWS' as const,
        authorId: user.id
      }
    ]

    // 投稿を作成
    for (const post of samplePosts) {
      await prisma.post.create({
        data: post
      })
    }

    console.log('サンプル投稿を作成しました！')
  } catch (error) {
    console.error('サンプル投稿の作成に失敗しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 直接実行する場合
if (require.main === module) {
  createSamplePosts()
}