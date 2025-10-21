import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

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

// カード一覧の取得
export async function GET(request: NextRequest) {
  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20))
    
    // Test database connection
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { success: false, error: 'データベース接続に失敗しました' },
        { status: 500 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const gameTitle = searchParams.get('gameTitle')
    const name = searchParams.get('name')
    const expansion = searchParams.get('expansion')
    const rarity = searchParams.get('rarity')
    const regulationMark = searchParams.get('regulationMark') // G, H, I レギュレーション
    const cardType = searchParams.get('cardType') // Pokémon, Trainer, Energy
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

  // 未登録カードの場合（日本語・英語どちらも許容）
  if (gameTitle === '未登録カード' || gameTitle === 'Unregistered Cards') {
      const where: Prisma.UnregisteredCardWhereInput = {}
      
      if (name) where.name = { contains: name, mode: 'insensitive' }
      if (expansion) where.expansion = { contains: expansion, mode: 'insensitive' }

      // 総件数の取得
      const totalCount = await prisma.unregisteredCard.count({ where })

      // 未登録カード一覧の取得
      const unregisteredCards = await prisma.unregisteredCard.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })

      // レスポンスデータの整形
        const formattedCards = unregisteredCards.map(card => ({
          id: card.id,
          name: card.name,
          gameTitle: '未登録カード',
          cardNumber: card.cardNumber,
          expansion: card.expansion,
          latestPrice: null,
          activeListing: 0,
          createdAt: card.createdAt,
          // DBのrarityを返す
          rarity: card.rarity,
          nameJa: null,
          expansionJa: null,
          effectText: null,
          effectTextJa: null,
          flavorText: null,
          imageUrl: null,
          regulationMark: null,
          cardType: null,
          cardTypeJa: null,
          hp: null,
          types: null,
          typesJa: null,
          evolveFrom: null,
          evolveFromJa: null,
          artist: null,
          subtypes: null,
          subtypesJa: null,
          releaseDate: null,
          apiId: null,
          setId: null,
          legalities: null,
          attacks: null,
          abilities: null,
          weaknesses: null,
          resistances: null,
          retreatCost: null,
          rules: null,
          nationalPokedexNumbers: null,
          source: null
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
    }

    // 通常のカードの場合
    // 検索条件の構築
    const where: Prisma.CardWhereInput = {}
    
    // gameTitleの正規化（削除 - データベースの実際の値を使用）
    console.log('gameTitle:', gameTitle)
    
    if (gameTitle) where.gameTitle = { contains: gameTitle, mode: 'insensitive' }
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
      select: {
        id: true,
        name: true,
        nameJa: true,
        gameTitle: true,
        cardNumber: true,
        expansion: true,
        expansionJa: true,
        rarity: true,
        effectText: true,
        effectTextJa: true,
        flavorText: true,
        imageUrl: true,
        regulationMark: true,
        cardType: true,
        cardTypeJa: true,
        hp: true,
        types: true,
        typesJa: true,
        evolveFrom: true,
        evolveFromJa: true,
        artist: true,
        subtypes: true,
        subtypesJa: true,
        releaseDate: true,
        createdAt: true,
        apiId: true,
        setId: true,
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
      apiId: card.apiId,
      expansion: card.expansion,
      expansionJa: card.expansionJa,
      rarity: card.rarity,
      effectText: decodeHtmlEntities(card.effectText),
      effectTextJa: decodeHtmlEntities(card.effectTextJa),
      flavorText: decodeHtmlEntities(card.flavorText),
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
      setId: card.setId,
      latestPrice: card.prices[0]?.price || null,
      activeListing: card._count.listings,
      createdAt: card.createdAt,
      // JSONフィールドのデコード
      legalities: card.legalities ? Object.entries(card.legalities).map(([key, value]) => `${key}: ${value}`).join(', ') : null,
      attacks: decodeTextFields(card.attacks),
      abilities: decodeTextFields(card.abilities),
      weaknesses: decodeTextFields(card.weaknesses),
      resistances: decodeTextFields(card.resistances),
      retreatCost: decodeTextFields(card.retreatCost),
      rules: decodeTextFields(card.rules),
      nationalPokedexNumbers: card.nationalPokedexNumbers,
      source: card.source
    }))

    return NextResponse.json({
      success: true,
      data: {
        cards: decodeTextFields(formattedCards), // ここでデコード
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