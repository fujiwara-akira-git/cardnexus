import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createSampleDecks = async () => {
  try {
    // ユーザーとカードを取得
    const user = await prisma.user.findFirst()
    const cards = await prisma.card.findMany({ take: 20 })
    
    if (!user || cards.length === 0) {
      console.log('ユーザーまたはカードが見つかりません。')
      return
    }

    // サンプルデッキを作成
    const sampleDecks = [
      {
        name: '雷タイプ高速デッキ',
        description: 'ピカチュウVMAXを中心とした高速アタックデッキです。序盤から圧倒的な火力で相手を圧倒します。',
        gameTitle: 'ポケモンカード',
        format: 'スタンダード',
        isPublic: true,
        userId: user.id,
        tags: ['雷タイプ', 'アタッカー', '高速'],
        cards: [
          { cardId: cards[0]?.id, quantity: 4 },
          { cardId: cards[1]?.id, quantity: 3 },
          { cardId: cards[2]?.id, quantity: 2 },
          { cardId: cards[3]?.id, quantity: 4 },
          { cardId: cards[4]?.id, quantity: 3 },
          { cardId: cards[5]?.id, quantity: 4 },
          { cardId: cards[6]?.id, quantity: 2 },
          { cardId: cards[7]?.id, quantity: 1 },
        ].filter(card => card.cardId)
      },
      {
        name: 'コントロール型水デッキ',
        description: '水タイプポケモンで相手の動きを封じつつ、確実にダメージを与えていく戦略デッキです。',
        gameTitle: 'ポケモンカード',
        format: 'エクスパンデッド',
        isPublic: true,
        userId: user.id,
        tags: ['水タイプ', 'コントロール', '守備'],
        cards: [
          { cardId: cards[1]?.id, quantity: 3 },
          { cardId: cards[2]?.id, quantity: 4 },
          { cardId: cards[3]?.id, quantity: 2 },
          { cardId: cards[4]?.id, quantity: 4 },
          { cardId: cards[5]?.id, quantity: 3 },
          { cardId: cards[6]?.id, quantity: 4 },
          { cardId: cards[7]?.id, quantity: 2 },
        ].filter(card => card.cardId)
      },
      {
        name: 'バランス型デッキ',
        description: '様々なタイプのカードをバランス良く組み合わせた万能デッキです。初心者にもおすすめです。',
        gameTitle: 'ポケモンカード',
        format: 'スタンダード',
        isPublic: true,
        userId: user.id,
        tags: ['バランス', '初心者向け', 'オールラウンド'],
        cards: [
          { cardId: cards[0]?.id, quantity: 2 },
          { cardId: cards[1]?.id, quantity: 2 },
          { cardId: cards[2]?.id, quantity: 2 },
          { cardId: cards[3]?.id, quantity: 3 },
          { cardId: cards[4]?.id, quantity: 3 },
          { cardId: cards[5]?.id, quantity: 3 },
          { cardId: cards[6]?.id, quantity: 2 },
          { cardId: cards[7]?.id, quantity: 2 },
        ].filter(card => card.cardId)
      }
    ]

    for (const deckData of sampleDecks) {
      await prisma.$transaction(async (tx) => {
        // デッキ作成
        const deck = await tx.deck.create({
          data: {
            name: deckData.name,
            description: deckData.description,
            gameTitle: deckData.gameTitle,
            format: deckData.format,
            isPublic: deckData.isPublic,
            userId: deckData.userId,
          },
        })

        // カードを追加
        const deckCards = deckData.cards.map(card => ({
          deckId: deck.id,
          cardId: card.cardId,
          quantity: card.quantity,
        }))

        await tx.deckCard.createMany({
          data: deckCards,
        })

        // タグを追加
        const deckTags = deckData.tags.map(tag => ({
          deckId: deck.id,
          tagName: tag,
        }))

        await tx.deckTag.createMany({
          data: deckTags,
        })
      })
    }

    console.log('サンプルデッキを作成しました！')
  } catch (error) {
    console.error('サンプルデッキの作成に失敗しました:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 直接実行する場合
if (require.main === module) {
  createSampleDecks()
}