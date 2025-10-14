import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Card Database...')

    // ポケモンカードのサンプルデータ（Cardスキーマに合わせて修正）
  const cards = [
    {
      name: 'ピカチュウVMAX',
      gameTitle: 'ポケモンカード',
      cardNumber: 'SWP-001',
      expansion: 'ソード＆シールド プロモ',
      rarity: 'RRR',
      effectText: 'このポケモンについているエネルギーの数×60ダメージ追加。',
      imageUrl: '/images/cards/pikachu-vmax.jpg'
    },
    {
      name: 'リザードンVSTAR',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S12a-011',
      expansion: 'VSTARユニバース',
      rarity: 'RRR',
      effectText: '相手のポケモン全員に、それぞれ30ダメージ。',
      imageUrl: '/images/cards/charizard-vstar.jpg'
    },
    {
      name: 'フシギバナVMAX',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S4-002',
      expansion: '仰天のボルテッカー',
      rarity: 'RRR',
      effectText: '自分の草ポケモン全員のHPを、それぞれ30回復する。',
      imageUrl: '/images/cards/venusaur-vmax.jpg'
    },
    {
      name: 'カメックスVMAX',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S2-009',
      expansion: '反逆クラッシュ',
      rarity: 'RRR',
      effectText: '相手のポケモン1匹に、60ダメージ。',
      imageUrl: '/images/cards/blastoise-vmax.jpg'
    },
    {
      name: 'ゲンガーVMAX',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S4a-020',
      expansion: 'ハイクラスパック シャイニースターV',
      rarity: 'RRR',
      effectText: 'このポケモンにも30ダメージ。',
      imageUrl: '/images/cards/gengar-vmax.jpg'
    },
    {
      name: 'ルカリオVSTAR',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S9-048',
      expansion: 'スターバース',
      rarity: 'RRR',
      effectText: '相手のベンチポケモンを2匹まで選び、それぞれに20ダメージ。',
      imageUrl: '/images/cards/lucario-vstar.jpg'
    },
    {
      name: 'イーブイVMAX',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S6a-069',
      expansion: 'イーブイヒーローズ',
      rarity: 'RRR',
      effectText: '自分のベンチのポケモンの数×20ダメージ追加。',
      imageUrl: '/images/cards/eevee-vmax.jpg'
    },
    {
      name: 'アルセウスVSTAR',
      gameTitle: 'ポケモンカード',
      cardNumber: 'S9-123',
      expansion: 'スターバース',
      rarity: 'RRR',
      effectText: '自分の山札から基本エネルギーを3枚まで選び、自分のポケモンに好きなようにつける。',
      imageUrl: '/images/cards/arceus-vstar.jpg'
    }
  ]

  // カードデータの挿入
  for (const cardData of cards) {
    const card = await prisma.card.create({
      data: cardData
    })

    // 価格履歴のサンプルデータ
    const basePrice = Math.floor(Math.random() * 15000) + 3000 // 3000-18000円
    const priceHistory = []

    // 過去30日間の価格データを生成
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // 価格に±20%の変動を追加
      const variation = (Math.random() - 0.5) * 0.4 // -20%から+20%
      const price = Math.floor(basePrice * (1 + variation))

      priceHistory.push({
        cardId: card.id,
        price: Math.max(price, 500), // 最低500円
        recordedAt: date,
        source: i % 3 === 0 ? 'mercari' : i % 3 === 1 ? 'yahoo_auction' : 'pokemon_center',
        condition: Math.random() > 0.7 ? '美品' : Math.random() > 0.3 ? '良好' : 'やや傷あり'
      })
    }

    // 価格履歴を一括挿入
    await prisma.price.createMany({
      data: priceHistory
    })

    console.log(`✅ Created card: ${card.name} with ${priceHistory.length} price entries`)
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })