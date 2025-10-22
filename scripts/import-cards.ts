import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
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
 * GitHubから取得したカードデータをPrismaのCard形式に変換
 */
function transformCardData(card: Record<string, unknown>): Record<string, unknown> {
  const apiId = (card.id as string) || '';
  const setId = apiId ? apiId.split('-')[0] : null;

  return {
    apiId,
    name: card.name as string,
    gameTitle: 'Pokemon TCG',
  imageUrl: (card.imageUrl as string) || null,
  rarity: (card.rarity as string) || null,
  effectText: (card.flavorText as string) || null,
  cardNumber: (card.number as string) || null,
  expansion: (card.setCode as string) || null,
  regulationMark: (card.regulation as string) || (card.regulationMark as string) || null,
  cardType: (card.supertype as string) || null,
  supertype: (card.supertype as string) || null,
  hp: (card.hp as number) || null,
  types: Array.isArray(card.types) ? (card.types as string[]).join(', ') : (card.types as string) || null,
  evolveFrom: (card.evolvesFrom as string) || null,
  artist: (card.artist as string) || null,
  subtypes: Array.isArray(card.subtypes) ? (card.subtypes as string[]).join(', ') : (card.subtypes as string) || null,
  releaseDate: null, // GitHubデータには含まれていない
  setId,

    // 追加: Json型フィールド
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weaknesses: card.weaknesses || [],
    resistances: card.resistances || [],
    retreatCost: card.retreatCost || [],
    legalities: card.legalities || {},
    rules: card.rules || [],
    source: (card.source as string) || null,
    nationalPokedexNumbers: card.nationalPokedexNumbers || [],
  };
}

/**
 * JSONファイルからカードデータを読み込み
 */
function loadCardData(filePath: string): Record<string, unknown>[] {
  if (!fsSync.existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${filePath}`);
    return [];
  }

  try {
    const data = fsSync.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as Record<string, unknown>[];
  } catch (error) {
    console.error(`❌ ファイル読み込みエラー: ${filePath}`, error);
    return [];
  }
}

/**
 * カードデータをデータベースにインポート（バッチ処理）
 */
async function importCards(cards: Record<string, unknown>[], regulation: string): Promise<void> {
  console.log(`📦 ${regulation}レギュレーション: ${cards.length}枚のカードをインポート開始`);
  
  const batchSize = 100; // バッチサイズ
  let importedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
  const transformedBatch = batch.map(card => transformCardData(card));
    
    try {
      // upsertMany操作（存在しない場合は作成、存在する場合は更新）
      for (const cardData of transformedBatch) {
        // Build a typed object for Prisma (pick known properties)
        const cardCreate = {
          apiId: cardData.apiId as string,
          name: cardData.name as string,
          gameTitle: cardData.gameTitle as string,
          imageUrl: cardData.imageUrl as string | null,
          rarity: cardData.rarity as string | null,
          effectText: cardData.effectText as string | null,
          cardNumber: cardData.cardNumber as string | null,
          expansion: cardData.expansion as string | null,
          regulationMark: cardData.regulationMark as string | null,
          cardType: cardData.cardType as string | null,
          supertype: cardData.supertype as string | null,
          hp: cardData.hp as number | null,
          types: cardData.types as string | null,
          evolveFrom: cardData.evolveFrom as string | null,
          artist: cardData.artist as string | null,
          subtypes: cardData.subtypes as string | null,
          releaseDate: cardData.releaseDate as string | null,
          setId: cardData.setId as string | null,
          abilities: cardData.abilities as Prisma.InputJsonValue,
          attacks: cardData.attacks as Prisma.InputJsonValue,
          weaknesses: cardData.weaknesses as Prisma.InputJsonValue,
          resistances: cardData.resistances as Prisma.InputJsonValue,
          retreatCost: cardData.retreatCost as Prisma.InputJsonValue,
          legalities: cardData.legalities as Prisma.InputJsonValue,
          rules: cardData.rules as Prisma.InputJsonValue,
          source: cardData.source as string | null,
          nationalPokedexNumbers: cardData.nationalPokedexNumbers as Prisma.InputJsonValue,
          updatedAt: new Date(),
        };

        await prisma.card.upsert({
          where: { apiId: cardCreate.apiId },
          update: cardCreate,
          create: cardCreate,
        });
      }
      
      importedCount += batch.length;
      const progress = ((i + batch.length) / cards.length * 100).toFixed(1);
      console.log(`✅ バッチ ${Math.floor(i / batchSize) + 1}: ${batch.length}枚処理完了 (進捗: ${progress}%)`);
      
    } catch (error) {
      console.error(`❌ バッチ ${Math.floor(i / batchSize) + 1} エラー:`, error);
      errorCount += batch.length;
    }
  }
  
  console.log(`📊 ${regulation}レギュレーション完了:`);
  console.log(`   ✅ 成功: ${importedCount}枚`);
  console.log(`   ❌ エラー: ${errorCount}枚`);
}

/**
 * 全レギュレーションのデータをインポート
 */
async function importAllRegulations(): Promise<void> {
  console.log('🚀 Pokemon TCGデータベースインポート開始');
  console.log('============================================================');
  
  const startTime = Date.now();
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  // 既存のカード数を確認
  const existingCount = await prisma.card.count();
  console.log(`📊 既存カード数: ${existingCount}枚`);
  
  // 各レギュレーションのデータをインポート
  const regulations = ['G', 'H', 'I'];
  let totalImported = 0;
  
  for (const regulation of regulations) {
    const filePath = path.join(dataDir, `regulation-${regulation}-github.json`);
    const cards = loadCardData(filePath);
    
    if (cards.length > 0) {
      await importCards(cards, regulation);
      totalImported += cards.length;
    } else {
      console.log(`⚠️  ${regulation}レギュレーションのデータが見つかりません`);
    }
  }
  
  // 最終結果
  const finalCount = await prisma.card.count();
  const newCards = finalCount - existingCount;
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n============================================================');
  console.log('🎉 データベースインポート完了');
  console.log(`📊 処理対象: ${totalImported}枚`);
  console.log(`📊 新規追加: ${newCards}枚`);
  console.log(`📊 総カード数: ${finalCount}枚`);
  console.log(`⏱️  実行時間: ${duration}分`);
}

/**
 * 単一レギュレーションのみインポート
 */
async function importSingleRegulation(regulation: string): Promise<void> {
  console.log(`🚀 ${regulation}レギュレーション データベースインポート開始`);
  console.log('============================================================');
  
  const startTime = Date.now();
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  const filePath = path.join(dataDir, `regulation-${regulation}-github.json`);
  
  // 既存のカード数を確認
  const existingCount = await prisma.card.count();
  console.log(`📊 既存カード数: ${existingCount}枚`);
  
  const cards = loadCardData(filePath);
  
  if (cards.length > 0) {
    await importCards(cards, regulation);
  } else {
    console.log(`⚠️  ${regulation}レギュレーションのデータが見つかりません`);
    return;
  }
  
  // 最終結果
  const finalCount = await prisma.card.count();
  const newCards = finalCount - existingCount;
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n============================================================');
  console.log(`🎉 ${regulation}レギュレーション インポート完了`);
  console.log(`📊 処理対象: ${cards.length}枚`);
  console.log(`📊 新規追加: ${newCards}枚`);
  console.log(`📊 総カード数: ${finalCount}枚`);
  console.log(`⏱️  実行時間: ${duration}分`);
}

/**
 * データベース統計情報を表示
 */
async function showStats(): Promise<void> {
  console.log('📊 データベース統計情報');
  console.log('============================================================');
  
  const totalCards = await prisma.card.count();
  console.log(`🎴 総カード数: ${totalCards}枚`);
  
  // レギュレーション別統計
  for (const regulation of ['G', 'H', 'I']) {
    const count = await prisma.card.count({
      where: { regulationMark: regulation }
    });
    console.log(`   ${regulation}レギュレーション: ${count}枚`);
  }
  
  // カードタイプ別統計
  const cardTypes = await prisma.card.groupBy({
    by: ['cardType'],
    _count: { cardType: true },
    orderBy: { _count: { cardType: 'desc' } }
  });
  
  console.log('\n🃏 カードタイプ別:');
  for (const type of cardTypes) {
    if (type.cardType) {
      console.log(`   ${type.cardType}: ${type._count.cardType}枚`);
    }
  }
  
  // レアリティ別統計（上位10位）
  const rarities = await prisma.card.groupBy({
    by: ['rarity'],
    _count: { rarity: true },
    orderBy: { _count: { rarity: 'desc' } },
    take: 10
  });
  
  console.log('\n💎 レアリティ別 (上位10位):');
  for (const rarity of rarities) {
    if (rarity.rarity) {
      console.log(`   ${rarity.rarity}: ${rarity._count.rarity}枚`);
    }
  }
}

/**
 * メイン実行
 */
async function main(): Promise<void> {
  try {
    const command = process.argv[2];
    const regulation = process.argv[3];
    
    if (command === 'stats') {
      await showStats();
    } else if (command === 'single' && regulation && ['G', 'H', 'I'].includes(regulation)) {
      await importSingleRegulation(regulation);
    } else if (command === 'all' || !command) {
      await importAllRegulations();
    } else {
      console.log('使用方法:');
      console.log('  npm run import:cards         # 全レギュレーションをインポート');
      console.log('  npm run import:cards single G # Gレギュレーションのみインポート');
      console.log('  npm run import:cards stats    # データベース統計を表示');
    }
  } catch (error) {
    console.error('❌ 実行エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}