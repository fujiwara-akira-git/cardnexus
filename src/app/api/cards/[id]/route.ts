import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

// HTMLエンティティをデコードする関数
function decodeHtmlEntities(text: string | null): string | null {
  if (!text || typeof text !== 'string') return text;
  
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&bull;': '•',
    '&deg;': '°',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&ecirc;': 'ê',
    '&agrave;': 'à',
    '&acirc;': 'â',
    '&ugrave;': 'ù',
    '&ucirc;': 'û',
    '&ouml;': 'ö',
    '&auml;': 'ä',
    '&uuml;': 'ü',
    '&ccedil;': 'ç',
    '&ntilde;': 'ñ',
    '&oslash;': 'ø',
    '&aelig;': 'æ',
    '&szlig;': 'ß',
    '&thorn;': 'þ',
    '&eth;': 'ð',
    '&yacute;': 'ý',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&aacute;': 'á',
    '&ocirc;': 'ô',
    '&icirc;': 'î',
    '&aring;': 'å',
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8230;': '…',
    '&#169;': '©',
    '&#8482;': '™',
    '&#174;': '®',
    '&#189;': '½',
    '&#188;': '¼',
    '&#190;': '¾',
    '&#233;': 'é',
    '&#232;': 'è',
    '&#234;': 'ê',
    '&#224;': 'à',
    '&#226;': 'â',
    '&#249;': 'ù',
    '&#251;': 'û',
    '&#246;': 'ö',
    '&#228;': 'ä',
    '&#252;': 'ü',
    '&#231;': 'ç',
    '&#241;': 'ñ',
    '&#248;': 'ø',
    '&#230;': 'æ',
    '&#223;': 'ß',
    '&#254;': 'þ',
    '&#240;': 'ð',
    '&#253;': 'ý',
    '&#237;': 'í',
    '&#243;': 'ó',
    '&#250;': 'ú',
    '&#225;': 'á',
    '&#244;': 'ô',
    '&#238;': 'î',
    '&#229;': 'å'
  };
  
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // 数値文字参照の処理（&#233; など）
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // 16進数文字参照の処理（&#xE9; など）
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return decoded;
}

// オブジェクトや配列内のテキストを再帰的にデコードする関数
function decodeTextFields(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return decodeHtmlEntities(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => decodeTextFields(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const decoded: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      decoded[key] = decodeTextFields(value);
    }
    return decoded;
  }
  
  return obj;
}

// カード詳細情報の取得
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: cardId } = await params

    // まず通常のカードを検索
    let card = await prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        name: true,
        gameTitle: true,
        imageUrl: true,
        rarity: true,
        effectText: true,
        flavorText: true,
        setId: true,
        cardNumber: true,
        expansion: true,
        createdAt: true,
        updatedAt: true,
        apiId: true,
        artist: true,
        cardType: true,
        cardTypeJa: true,
        supertype: true,
        effectTextJa: true,
        evolveFrom: true,
        evolveFromJa: true,
        expansionJa: true,
        hp: true,
        nameJa: true,
        regulationMark: true,
        releaseDate: true,
        subtypes: true,
        subtypesJa: true,
        types: true,
        typesJa: true,
        attacks: true,
        abilities: true,
        weaknesses: true,
        resistances: true,
        retreatCost: true,
        rules: true,
        legalities: true,
        nationalPokedexNumbers: true,
        source: true,
        prices: {
          orderBy: { recordedAt: 'desc' },
          take: 30,
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
            { listingType: 'asc' },
            { createdAt: 'desc' }
          ]
        }
      }
    })

    // 通常のカードが見つからない場合、未登録カードを検索
    let isUnregisteredCard = false
    if (!card) {
      const unregisteredCard = await prisma.unregisteredCard.findUnique({
        where: { id: cardId }
      })

      if (unregisteredCard) {
        isUnregisteredCard = true
        // 未登録カードを通常のカード形式に変換
        card = {
          id: unregisteredCard.id,
          name: unregisteredCard.name,
          gameTitle: '未登録カード',
          cardNumber: unregisteredCard.cardNumber,
          expansion: unregisteredCard.expansion,
          createdAt: unregisteredCard.createdAt,
          updatedAt: unregisteredCard.createdAt, // createdAtを使用
    // 以下は未登録カードにはないフィールド
          nameJa: null,
          imageUrl: null,
          rarity: unregisteredCard.rarity,
          effectText: null,
          flavorText: null,
          setId: null,
          expansionJa: null,
          apiId: null,
          artist: null,
          cardType: null,
          cardTypeJa: null,
          supertype: null,
          effectTextJa: null,
          evolveFrom: null,
          evolveFromJa: null,
          hp: null,
          regulationMark: null,
          releaseDate: null,
          subtypes: null,
          subtypesJa: null,
          types: null,
          typesJa: null,
          attacks: null,
          abilities: null,
          weaknesses: null,
          resistances: null,
          retreatCost: null,
          rules: null,
          legalities: null,
          nationalPokedexNumbers: null,
          source: null,
          prices: [],
          listings: []
        }
      }
    }

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'カードが見つかりません' },
        { status: 404 }
      )
    }

    // 価格統計の計算（未登録カードの場合はなし）
    const priceStats = isUnregisteredCard ? {
      latest: null,
      average: null,
      min: null,
      max: null
    } : {
      latest: card.prices[0]?.price || null,
      average: card.prices.length > 0 
        ? Math.round(card.prices.reduce((sum, p) => sum + p.price, 0) / card.prices.length)
        : null,
      min: card.prices.length > 0 
        ? Math.min(...card.prices.map(p => p.price))
        : null,
      max: card.prices.length > 0 
        ? Math.max(...card.prices.map(p => p.price))
        : null
    }

    // レスポンスデータの整形
  const response = {
      id: card.id,
      name: card.name,
      nameJa: card.nameJa,
      gameTitle: card.gameTitle,
      cardNumber: card.cardNumber,
      apiId: card.apiId,
      expansion: card.expansion,
      expansionJa: card.expansionJa,
      rarity: card.rarity,
      effectText: decodeHtmlEntities(card.effectText),
      effectTextJa: decodeHtmlEntities(card.effectTextJa),
      flavorText: decodeHtmlEntities(card.flavorText),
      setId: card.setId,
      imageUrl: card.imageUrl,
      regulationMark: card.regulationMark,
      cardType: card.cardType,
      cardTypeJa: card.cardTypeJa,
      supertype: card.supertype,
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
      // --- 追加: JSONフィールド ---
      abilities: decodeTextFields(card.abilities),
      attacks: decodeTextFields(card.attacks),
      weaknesses: decodeTextFields(card.weaknesses),
      resistances: decodeTextFields(card.resistances),
      retreatCost: decodeTextFields(card.retreatCost),
      legalities: decodeTextFields(card.legalities),
      rules: decodeTextFields(card.rules),
      nationalPokedexNumbers: card.nationalPokedexNumbers,
      priceStats,
      priceHistory: isUnregisteredCard ? [] : card.prices.map(price => ({
        id: price.id,
        price: price.price,
        source: price.source,
        condition: price.condition,
        recordedAt: price.recordedAt
      })),
      activeListings: isUnregisteredCard ? [] : card.listings.map(listing => ({
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