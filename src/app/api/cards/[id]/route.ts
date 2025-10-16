import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// カード詳細情報の取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params

    // カード詳細の取得（価格履歴、アクティブな出品も含む）
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        prices: {
          orderBy: { recordedAt: 'desc' },
          take: 30, // 最新30件の価格履歴
        },
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                rating: true,
                ratingCount: true,
                profileImageUrl: true
              }
            }
          },
          orderBy: [
            { listingType: 'asc' }, // SELL, BUY, TRADE の順
            { createdAt: 'desc' }
          ]
        }
      }
    })

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'カードが見つかりません' },
        { status: 404 }
      )
    }

    // 価格統計の計算
    const recentPrices = card.prices.slice(0, 10) // 最新10件
    const priceStats = {
      latest: card.prices[0]?.price || null,
      average: recentPrices.length > 0 
        ? Math.round(recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length)
        : null,
      min: recentPrices.length > 0 
        ? Math.min(...recentPrices.map(p => p.price))
        : null,
      max: recentPrices.length > 0 
        ? Math.max(...recentPrices.map(p => p.price))
        : null
    }

    // レスポンスデータの整形
    const response = {
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
      createdAt: card.createdAt,
      priceStats,
      priceHistory: card.prices.map(price => ({
        id: price.id,
        price: price.price,
        source: price.source,
        condition: price.condition,
        recordedAt: price.recordedAt
      })),
      activeListings: card.listings.map(listing => ({
        id: listing.id,
        type: listing.listingType,
        price: listing.price,
        condition: listing.condition || 'UNKNOWN',
        quantity: 1, // デフォルト値
        description: listing.description,
        user: {
          id: listing.user.id,
          name: listing.user.username,
          username: listing.user.username,
          image: listing.user.profileImageUrl,
          rating: listing.user.rating,
          reviewCount: listing.user.ratingCount
        },
        createdAt: listing.createdAt.toISOString(),
        expiresAt: null
      }))
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Card Detail API Error:', error)
    return NextResponse.json(
      { success: false, error: 'カード詳細情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}