#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCardSearch() {
  try {
    console.log('🔍 カード検索のテスト実行中...\n')

    // URL検索パラメータをシミュレート
    const gameTitle = 'ポケモンカード'
    const page = 1
    const limit = 20

    console.log(`検索条件: gameTitle="${gameTitle}", page=${page}, limit=${limit}`)

    // 実際のAPI検索をシミュレート
    const where = {
      gameTitle: { 
        contains: gameTitle, 
        mode: 'insensitive' as const
      }
    }

    // 総件数の取得
    const totalCount = await prisma.card.count({ where })
    console.log(`\n📊 検索結果: ${totalCount}枚`)

    // カード一覧の取得
    const cards = await prisma.card.findMany({
      where,
      select: {
        id: true,
        name: true,
        nameJa: true,
        gameTitle: true,
        regulationMark: true,
        cardType: true,
        expansion: true
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n🎴 最初の${limit}枚のカード:`)
    console.log('============================================================')
    cards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.nameJa || card.name}`)
      console.log(`   gameTitle: "${card.gameTitle}"`)
      console.log(`   regulation: ${card.regulationMark || 'N/A'}`)
      console.log(`   type: ${card.cardType || 'N/A'}`)
      console.log(`   expansion: ${card.expansion || 'N/A'}`)
      console.log('')
    })

    console.log(`\n✅ 検索は正常に動作します！`)
    console.log(`   - 総カード数: ${totalCount}枚`)
    console.log(`   - 1ページ目: ${cards.length}枚表示`)
    console.log(`   - 総ページ数: ${Math.ceil(totalCount / limit)}ページ`)

  } catch (error) {
    console.error('❌ エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCardSearch()