import { PrismaClient } from '@prisma/client';
import fsSync from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env.localファイルを読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * 全件JSONデータをPrismaのCard形式に変換
 */
function transformFullCardData(card: any): any {
  return {
    apiId: card.apiId,
    name: card.name,
    gameTitle: card.gameTitle,
    imageUrl: card.imageUrl,
    rarity: card.rarity,
    effectText: card.effectText || null,
    cardNumber: card.cardNumber,
    expansion: card.expansion,
    regulationMark: card.regulation,
    cardType: card.cardType,
    hp: card.hp || null,
    types: card.types ? (Array.isArray(card.types) ? card.types.join(', ') : card.types) : null,
    evolveFrom: card.evolveFrom || null,
    artist: card.artist,
    subtypes: card.subtypes ? (Array.isArray(card.subtypes) ? card.subtypes.join(', ') : card.subtypes) : null,
    releaseDate: card.releaseDate || null,

    // Json型フィールド
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weaknesses: card.weaknesses || [],
    resistances: card.resistances || [],
    retreatCost: card.retreatCost || [],
    legalities: card.legalFormats || card.legalities || {},
    rules: card.rules || [],
    source: card.source || null,
    nationalPokedexNumbers: card.nationalPokedexNumbers || [],

    // 日本語フィールド
    nameJa: card.nameJa || null,
    cardTypeJa: card.cardTypeJa || null,
    effectTextJa: card.effectTextJa || null,
    evolveFromJa: card.evolveFromJa || null,
    expansionJa: card.expansionJa || null,
    subtypesJa: card.subtypesJa || null,
    typesJa: card.typesJa || null,
  };
}

/**
 * 全件JSONファイルからカードデータを読み込み
 */
function loadFullCardData(filePath: string): any[] {
  if (!fsSync.existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${filePath}`);
    return [];
  }

  try {
    const data = fsSync.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ ファイル読み込みエラー: ${filePath}`, error);
    return [];
  }
}

/**
 * 全件カードデータをデータベースにインポート
 */
async function importFullCards(cards: any[]): Promise<void> {
  console.log(`📦 全件カードデータ: ${cards.length}枚のカードをインポート開始`);

  const batchSize = 100;
  let importedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    const transformedBatch = batch.map(card => transformFullCardData(card));

    try {
      for (const cardData of transformedBatch) {
        const existingCard = await prisma.card.findUnique({
          where: { apiId: cardData.apiId }
        });

        if (existingCard) {
          // 更新
          await prisma.card.update({
            where: { apiId: cardData.apiId },
            data: cardData,
          });
          updatedCount++;
        } else {
          // 新規作成
          await prisma.card.create({
            data: cardData,
          });
          importedCount++;
        }
      }

      const progress = ((i + batch.length) / cards.length * 100).toFixed(1);
      console.log(`✅ バッチ ${Math.floor(i / batchSize) + 1}: ${batch.length}枚処理完了 (進捗: ${progress}%)`);

    } catch (error) {
      console.error(`❌ バッチ ${Math.floor(i / batchSize) + 1} エラー:`, error);
      errorCount += batch.length;
    }
  }

  console.log(`📊 全件インポート完了:`);
  console.log(`   ✅ 新規作成: ${importedCount}枚`);
  console.log(`   🔄 更新: ${updatedCount}枚`);
  console.log(`   ❌ エラー: ${errorCount}枚`);
}

/**
 * メイン実行
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 全件JSONデータベースインポート開始');
    console.log('============================================================');

    const startTime = Date.now();
    const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');

    // 既存のカード数を確認
    const existingCount = await prisma.card.count();
    console.log(`📊 既存カード数: ${existingCount}枚`);

    // すべてのlargeファイルをインポート
    const largeFiles = ['regulation-G-large.json', 'regulation-H-large.json', 'regulation-I-large.json'];
    let totalProcessed = 0;

    for (const fileName of largeFiles) {
      const filePath = path.join(dataDir, fileName);
      console.log(`\n📂 ${fileName} を処理中...`);

      const cards = loadFullCardData(filePath);

      if (cards.length > 0) {
        await importFullCards(cards);
        totalProcessed += cards.length;
      } else {
        console.log(`⚠️  ${fileName} のデータが見つかりません`);
      }
    }

    // 最終結果
    const finalCount = await prisma.card.count();
    const newCards = finalCount - existingCount;

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);

    console.log('\n============================================================');
    console.log('🎉 全件JSONインポート完了');
    console.log(`📊 処理対象: ${totalProcessed}枚`);
    console.log(`📊 変更: ${newCards}枚`);
    console.log(`📊 総カード数: ${finalCount}枚`);
    console.log(`⏱️  実行時間: ${duration}分`);

  } catch (error) {
    console.error('❌ 実行エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}