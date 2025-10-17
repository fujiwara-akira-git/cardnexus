#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateGameTitles() {
  try {
    console.log('🔧 gameTitleを統一中...')

    // "Pokemon TCG" を "ポケモンカード" に統一
    const result = await prisma.card.updateMany({
      where: {
        gameTitle: 'Pokemon TCG'
      },
      data: {
        gameTitle: 'ポケモンカード'
      }
    })

    console.log(`✅ ${result.count}枚のカードのgameTitleを更新しました`)

    // 結果を確認
    const updatedCounts = await prisma.card.groupBy({
      by: ['gameTitle'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    console.log('\n📊 更新後のgameTitleごとのカード数:')
    console.log('============================================================')
    updatedCounts.forEach(item => {
      console.log(`${item.gameTitle}: ${item._count.id}枚`)
    })

  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateGameTitles()