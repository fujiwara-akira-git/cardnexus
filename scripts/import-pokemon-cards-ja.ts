/**
 * ポケモンカード日本語データインポートスクリプト
 * 日本語翻訳済みのJSONデータをデータベースにインポート
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LocalizedCardData {
  apiId: string;
  name: string;
  nameJa: string;
  gameTitle: string;
  imageUrl: string;
  rarity: string | null;
  effectText: string | null;
  effectTextJa: string | null;
  cardNumber: string;
  expansion: string;
  expansionJa: string;
  regulation: string;
  cardType: string;
  cardTypeJa: string;
  hp: number | null;
  types: string | null;
  typesJa: string | null;
  evolveFrom: string | null;
  evolveFromJa: string | null;
  releaseDate: string;
  artist: string | null;
  subtypes: string | null;
  subtypesJa: string | null;
}

/**
 * 日本語データをインポート
 */
async function importLocalizedCards(regulation: string): Promise<{
  newCount: number;
  updatedCount: number;
  skippedCount: number;
}> {
  const dataDir = path.join(__dirname, '..', 'data', 'pokemon-cards-ja');
  const filePath = path.join(dataDir, `regulation-${regulation}-ja.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ファイルが見つかりません: ${filePath}`);
    return { newCount: 0, updatedCount: 0, skippedCount: 0 };
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const cards: LocalizedCardData[] = JSON.parse(rawData);

  console.log(`\n${regulation}レギュレーション: ${cards.length}枚をインポート中...`);

  let newCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    try {
      // cardNumberとexpansionの組み合わせでカードを検索
      const existingCard = await prisma.card.findFirst({
        where: {
          cardNumber: card.cardNumber,
          expansion: card.expansion,
        },
      });

      if (existingCard) {
        // 既存カードを更新（日本語フィールドを追加）
        await prisma.card.update({
          where: { id: existingCard.id },
          data: {
            nameJa: card.nameJa,
            effectTextJa: card.effectTextJa,
            expansionJa: card.expansionJa,
            cardTypeJa: card.cardTypeJa,
            typesJa: card.typesJa,
            evolveFromJa: card.evolveFromJa,
            subtypesJa: card.subtypesJa,
            // 英語フィールドも更新（データが新しい可能性があるため）
            name: card.name,
            effectText: card.effectText,
            imageUrl: card.imageUrl,
            rarity: card.rarity,
            regulationMark: card.regulation,
            cardType: card.cardType,
            hp: card.hp,
            types: card.types,
            evolveFrom: card.evolveFrom,
            artist: card.artist,
            subtypes: card.subtypes,
            releaseDate: card.releaseDate,
          },
        });
        updatedCount++;
      } else {
        // 新規カードを作成
        await prisma.card.create({
          data: {
            apiId: card.apiId,
            name: card.name,
            nameJa: card.nameJa,
            gameTitle: card.gameTitle,
            imageUrl: card.imageUrl,
            rarity: card.rarity,
            effectText: card.effectText,
            effectTextJa: card.effectTextJa,
            cardNumber: card.cardNumber,
            expansion: card.expansion,
            expansionJa: card.expansionJa,
            regulationMark: card.regulation,
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
          },
        });
        newCount++;
      }

      // 進捗表示（100枚ごと）
      if ((i + 1) % 100 === 0) {
        console.log(`  進捗: ${i + 1}/${cards.length}`);
      }
    } catch (error) {
      console.error(`  カード「${card.name}」のインポートに失敗:`, error);
      skippedCount++;
    }
  }

  console.log(`  完了: 新規${newCount}枚 / 更新${updatedCount}枚 / スキップ${skippedCount}枚`);

  return { newCount, updatedCount, skippedCount };
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('ポケモンカード日本語データインポートスクリプト');
  console.log('対象レギュレーション: G, H, I');
  console.log('='.repeat(60));

  console.log('\nデータベースに接続しました');

  const regulations = ['G', 'H', 'I'];
  const summary = {
    totalNew: 0,
    totalUpdated: 0,
    totalSkipped: 0,
  };

  for (const regulation of regulations) {
    const result = await importLocalizedCards(regulation);
    summary.totalNew += result.newCount;
    summary.totalUpdated += result.updatedCount;
    summary.totalSkipped += result.skippedCount;
  }

  console.log('\n' + '='.repeat(60));
  console.log('インポート完了');
  console.log(`  合計: ${summary.totalNew + summary.totalUpdated}枚のカードを保存しました`);
  console.log(`  新規: ${summary.totalNew}枚`);
  console.log(`  更新: ${summary.totalUpdated}枚`);
  console.log(`  スキップ: ${summary.totalSkipped}枚`);
  console.log('='.repeat(60));

  // データベース内の統計を表示
  const totalCount = await prisma.card.count({
    where: { gameTitle: 'ポケモンカード' },
  });

  const gCount = await prisma.card.count({
    where: { gameTitle: 'ポケモンカード', regulationMark: 'G' },
  });

  const hCount = await prisma.card.count({
    where: { gameTitle: 'ポケモンカード', regulationMark: 'H' },
  });

  const iCount = await prisma.card.count({
    where: { gameTitle: 'ポケモンカード', regulationMark: 'I' },
  });

  const jaCount = await prisma.card.count({
    where: { 
      gameTitle: 'ポケモンカード',
      nameJa: { not: null },
    },
  });

  console.log(`\nデータベース内のポケモンカード総数: ${totalCount}枚`);
  console.log(`  Gレギュレーション: ${gCount}枚`);
  console.log(`  Hレギュレーション: ${hCount}枚`);
  console.log(`  Iレギュレーション: ${iCount}枚`);
  console.log(`  日本語データあり: ${jaCount}枚`);
}

// スクリプト実行
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('予期しないエラー:', error);
      process.exit(1);
    })
    .finally(async () => {
      console.log('\nデータベース接続を切断しました');
      await prisma.$disconnect();
    });
}

export { importLocalizedCards };
