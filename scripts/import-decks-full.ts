import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env.localファイルを読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * GitHubからデッキデータを取得
 */
async function fetchDeckData(fileName: string): Promise<Record<string, unknown>[]> {
  const url = `https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/decks/en/${fileName}`;
  console.log(`📥 ${fileName} を取得中...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  const data = await response.json();
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : ([data] as Record<string, unknown>[]);
  } catch (error) {
    console.error(`❌ ${fileName} の取得に失敗:`, error);
    return [];
  }
}

/**
 * GitHubからデッキファイル一覧を取得
 */
async function fetchDeckFileList(): Promise<string[]> {
  const url = 'https://api.github.com/repos/PokemonTCG/pokemon-tcg-data/contents/decks/en';
  console.log('📂 GitHubからデッキファイル一覧を取得中...');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const files = (await response.json()) as unknown;

    // .jsonファイルのみをフィルタリング
    const jsonFiles = Array.isArray(files)
      ? files
          .filter((file) => typeof (file as { name?: unknown }).name === 'string' && ((file as { name: string }).name.endsWith('.json')))
          .map((file) => (file as { name: string }).name)
      : [];

    console.log(`📋 ${jsonFiles.length}個のデッキファイルが見つかりました`);
    return jsonFiles;
  } catch (error) {
    console.error('❌ ファイル一覧取得エラー:', error);
    return [];
  }
}

/**
 * デッキデータをPrismaのDeck形式に変換
 */
function transformDeckData(deck: { id: string; name: string; types?: string[]; cards?: { id: string; name: string; count: number }[] }, userId: string) {
  return {
    id: deck.id,
    name: deck.name,
    gameTitle: 'ポケモンカード',
    types: deck.types ? deck.types.join(', ') : null,
    format: 'Standard', // デフォルト値
    description: `Imported deck: ${deck.name}`,
    userId: userId,
    isPublic: true,
    cards: deck.cards || []
  };
}

/**
 * デッキデータをデータベースにインポート
 */
async function importDecks(decks: Record<string, unknown>[]): Promise<void> {
  console.log(`📦 ${decks.length}件のデッキをインポート開始`);

  // システムユーザーを作成または取得
  const systemUser = await prisma.user.upsert({
    where: { username: 'system' },
    update: {},
    create: {
      username: 'system',
      email: 'system@cardnexus.local',
      bio: 'System user for imported decks'
    }
  });

  console.log(`👤 システムユーザー: ${systemUser.username} (ID: ${systemUser.id})`);

  let importedCount = 0;
  let errorCount = 0;
  let totalLinkedCards = 0;
  let totalMissingCards = 0;

  for (const deckData of decks) {
    try {
      // Narrow the incoming deckData shape minimally for downstream usage
      const src = deckData as unknown as { id: string; name: string; types?: string[]; cards?: Array<{ id: string; name: string; count: number; rarity?: string }> };
      const deck = transformDeckData(src, systemUser.id);

      // デッキを作成または更新
      const createdDeck = await prisma.deck.upsert({
        where: { id: deck.id },
        update: {
          name: deck.name,
          types: deck.types,
          format: deck.format,
          description: deck.description,
          updatedAt: new Date()
        },
        create: {
          id: deck.id,
          userId: deck.userId,
          name: deck.name,
          gameTitle: deck.gameTitle,
          types: deck.types,
          format: deck.format,
          description: deck.description,
          isPublic: deck.isPublic
        }
      });

      // デッキカードを追加
      let linkedCards = 0;
      let missingCards = 0;

      for (const card of deck.cards) {
        try {
          // CardテーブルからcardIdを取得（apiIdで検索）
          const dbCard = await prisma.card.findFirst({
            where: { apiId: card.id }
          });

          if (dbCard) {
            await prisma.deckCard.upsert({
              where: {
                deckId_cardId: {
                  deckId: createdDeck.id,
                  cardId: dbCard.id
                }
              },
              update: {
                quantity: card.count
              },
              create: {
                deckId: createdDeck.id,
                cardId: dbCard.id,
                quantity: card.count
              }
            });
            linkedCards++;
          } else {
            // カードが見つからない場合は UnregisteredCard に登録し、DeckUnregisteredCard を作成
            const expansion = (card.id || '').split('-')[0] || '';

              const unregisteredCard = await prisma.unregisteredCard.upsert({
              where: {
                name_cardNumber_expansion: {
                  name: card.name,
                  cardNumber: card.id,
                  expansion: expansion,
                }
              },
                update: {
                  updatedAt: new Date(),
                  rarity: ((card as { rarity?: string })?.rarity) || null,
                },
                create: {
                  name: card.name,
                  gameTitle: 'ポケモンカード',
                  cardNumber: card.id,
                  expansion: expansion,
                  types: null,
                  rarity: ((card as { rarity?: string })?.rarity) || null,
                }
            });

            await prisma.deckUnregisteredCard.upsert({
              where: {
                deckId_unregisteredCardId: {
                  deckId: createdDeck.id,
                  unregisteredCardId: unregisteredCard.id,
                }
              },
              update: {
                quantity: card.count,
              },
              create: {
                deckId: createdDeck.id,
                unregisteredCardId: unregisteredCard.id,
                quantity: card.count,
              }
            });

            missingCards++;
            console.warn(`⚠️  カード ${card.id} (${card.name}) が見つからないため UnregisteredCard に登録しました`);
          }
        } catch (error) {
          console.error(`❌ カード ${card.id} のリンクに失敗:`, error);
          missingCards++;
        }
      }

      console.log(`✅ ${deck.name} をインポート完了 (${linkedCards}枚リンク、${missingCards}枚スキップ)`);

      totalLinkedCards += linkedCards;
      totalMissingCards += missingCards;
      importedCount++;
    } catch (error) {
      console.error(`❌ ${deckData.name} のインポートに失敗:`, error);
      errorCount++;
    }
  }

  console.log(`\n============================================================`);
  console.log(`🎉 デッキインポート完了`);
  console.log(`📊 処理対象: ${decks.length}件`);
  console.log(`📊 成功: ${importedCount}件`);
  console.log(`❌ エラー: ${errorCount}件`);
  console.log(`🔗 リンクされたカード: ${totalLinkedCards}枚`);
  console.log(`⚠️  見つからなかったカード: ${totalMissingCards}枚`);
}

/**
 * メイン処理
 */
async function main() {
  try {
    // すべてのデッキファイルを取得
    const allFiles = await fetchDeckFileList();

    console.log(`🚀 ${allFiles.length}個のデッキファイルをすべて処理します`);

    for (const file of allFiles) {
      const decks = await fetchDeckData(file);
      if (decks.length > 0) {
        // すべてのデッキをインポート
        await importDecks(decks);
      }
    }

  } catch (error) {
    console.error('メイン処理エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
main();