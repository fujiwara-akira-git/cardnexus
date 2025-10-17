#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkGameTitles() {
  try {
    console.log('🔍 データベースのgameTitleフィールドを調査中...\n')

    // gameTitleごとのカード数を取得
    const gameTitleCounts = await prisma.card.groupBy({
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

    console.log('📊 gameTitleごとのカード数:')
    console.log('============================================================')
    gameTitleCounts.forEach(item => {
      console.log(`${item.gameTitle}: ${item._count.id}枚`)
    })

    console.log('\n🔍 "ポケモンカード"を含むレコードの詳細検索...')
    
    // "ポケモン"を含むgameTitleを検索
    const pokemonCards = await prisma.card.findMany({
      where: {
        gameTitle: {
          contains: 'ポケモン',
          mode: 'insensitive'
        }
      },
      select: {
        gameTitle: true,
        name: true
      },
      take: 5
    })

    console.log(`\nポケモン関連カード (最初の5件):`)
    pokemonCards.forEach(card => {
      console.log(`- ${card.name} (gameTitle: "${card.gameTitle}")`)
    })

    console.log('\n🔍 全てのユニークなgameTitleを確認...')
    
    const uniqueGameTitles = await prisma.card.findMany({
      select: {
        gameTitle: true
      },
      distinct: ['gameTitle']
    })

    console.log('\n全てのユニークなgameTitle:')
    uniqueGameTitles.forEach(item => {
      console.log(`"${item.gameTitle}"`)
    })

  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGameTitles()