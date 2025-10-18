import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// カード一覧の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameTitle = searchParams.get('gameTitle')
    const name = searchParams.get('name')
    const expansion = searchParams.get('expansion')
    const rarity = searchParams.get('rarity')
    const regulationMark = searchParams.get('regulationMark') // G, H, I レギュレーション
    const cardType = searchParams.get('cardType') // Pokémon, Trainer, Energy
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 検索条件の構築
    const where: Prisma.CardWhereInput = {}
    
    // gameTitleの正規化
    let normalizedGameTitle = gameTitle
    if (gameTitle === 'ポケモンカード') {
      normalizedGameTitle = 'Pokemon TCG'
    }
    
    if (normalizedGameTitle) where.gameTitle = { contains: normalizedGameTitle, mode: 'insensitive' }
    if (name) where.name = { contains: name, mode: 'insensitive' }
    if (expansion) where.expansion = { contains: expansion, mode: 'insensitive' }
    if (rarity) where.rarity = rarity
    if (regulationMark) where.regulationMark = regulationMark
    if (cardType) where.cardType = cardType

    // 総件数の取得
    const totalCount = await prisma.card.count({ where })

    // カード一覧の取得（価格情報も含む）
    const cards = await prisma.card.findMany({
      where,
      include: {
        prices: {
          orderBy: { recordedAt: 'desc' },
          take: 1, // 最新の価格のみ
        },
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // レスポンスデータの整形
    const formattedCards = cards.map(card => ({
      id: card.id,
      name: card.name,
      nameJa: card.nameJa,
      gameTitle: card.gameTitle,
      cardNumber: card.cardNumber,
      expansion: card.expansion,
      expansionJa: card.expansionJa,
      rarity: card.rarity,
      effectText: card.effectText,
      effectTextJa: card.effectTextJa,
      imageUrl: card.imageUrl,
      regulationMark: card.regulationMark,
      cardType: card.cardType,
      cardTypeJa: card.cardTypeJa,
      hp: card.hp,
      types: card.types,
      typesJa: card.typesJa,
      evolveFrom: card.evolveFrom,
      evolveFromJa: card.evolveFromJa,
      artist: card.artist,
      subtypes: card.subtypes,
      subtypesJa: card.subtypesJa,
      releaseDate: card.releaseDate,
      latestPrice: card.prices[0]?.price || null,
      activeListing: card._count.listings,
      createdAt: card.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        cards: formattedCards,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    })

  } catch (error) {
    console.error('Card API Error:', error)
    return NextResponse.json(
      { success: false, error: 'カードデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}