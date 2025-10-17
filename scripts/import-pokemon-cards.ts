/**
 * ポケモンカードデータインポートスクリプト
 * JSONファイルからデータベースにカード情報を保存
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface NormalizedCard {
  apiId: string;
  name: string;
  gameTitle: string;
  imageUrl: string;
  rarity: string | null;
  effectText: string | null;
  cardNumber: string;
  expansion: string;
  regulation: string;
  cardType: string;
  hp: number | null;
  types: string | null;
  evolveFrom: string | null;
  releaseDate: string;
  artist: string | null;
  subtypes: string | null;
}

/**
 * JSONファイルからカードデータを読み込む
 */
function loadCardsFromFile(regulation: string): NormalizedCard[] {
  const filePath = path.join(__dirname, '..', 'data', 'pokemon-cards', `regulation-${regulation}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`ファイルが見つかりません: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * カードデータをデータベースに保存
 */
async function importCards(regulation: string): Promise<number> {
  const cards = loadCardsFromFile(regulation);
  
  if (cards.length === 0) {
    console.log(`${regulation}レギュレーションのデータが見つかりません`);
    return 0;
  }

  console.log(`\n${regulation}レギュレーション: ${cards.length}枚をインポート中...`);

  let importCount = 0;
  let updateCount = 0;
  let skipCount = 0;

  for (const card of cards) {
    try {
      // カード番号と拡張パック名で既存カードをチェック
      const existing = await prisma.card.findFirst({
        where: {
          cardNumber: card.cardNumber,
          expansion: card.expansion,
          gameTitle: card.gameTitle,
        },
      });

      if (existing) {
        // 既存カードを更新
        await prisma.card.update({
          where: { id: existing.id },
          data: {
            apiId: card.apiId,
            name: card.name,
            imageUrl: card.imageUrl,
            rarity: card.rarity,
            effectText: card.effectText,
            regulationMark: card.regulation,
            cardType: card.cardType,
            hp: card.hp,
            types: Array.isArray(card.types) ? card.types.join(',') : card.types,
            evolveFrom: card.evolveFrom,
            artist: card.artist,
            subtypes: Array.isArray(card.subtypes) ? card.subtypes.join(',') : card.subtypes,
            releaseDate: card.releaseDate,
            updatedAt: new Date(),
          },
        });
        updateCount++;
      } else {
        // 新規カードを作成
        await prisma.card.create({
          data: {
            apiId: card.apiId,
            name: card.name,
            gameTitle: card.gameTitle,
            imageUrl: card.imageUrl,
            rarity: card.rarity,
            effectText: card.effectText,
            cardNumber: card.cardNumber,
            expansion: card.expansion,
            regulationMark: card.regulation,
            cardType: card.cardType,
            hp: card.hp,
            types: Array.isArray(card.types) ? card.types.join(',') : card.types,
            evolveFrom: card.evolveFrom,
            artist: card.artist,
            subtypes: Array.isArray(card.subtypes) ? card.subtypes.join(',') : card.subtypes,
            releaseDate: card.releaseDate,
          },
        });
        importCount++;
      }

      // 進捗表示
      if ((importCount + updateCount + skipCount) % 100 === 0) {
        process.stdout.write(`\r  進捗: ${importCount + updateCount + skipCount}/${cards.length}`);
      }
    } catch (error) {
      console.error(`\n  カード「${card.name}」(${card.cardNumber})のインポートに失敗:`, error);
      skipCount++;
    }
  }

  console.log(`\n  完了: 新規${importCount}枚 / 更新${updateCount}枚 / スキップ${skipCount}枚`);
  return importCount + updateCount;
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('ポケモンカードデータインポートスクリプト');
  console.log('対象レギュレーション: G, H, I');
  console.log('='.repeat(60));

  const regulations = ['G', 'H', 'I'];
  let totalImported = 0;

  try {
    // データベース接続確認
    await prisma.$connect();
    console.log('\nデータベースに接続しました');

    for (const regulation of regulations) {
      const count = await importCards(regulation);
      totalImported += count;
    }

    // サマリー表示
    console.log('\n' + '='.repeat(60));
    console.log('インポート完了');
    console.log(`  合計: ${totalImported}枚のカードを保存しました`);
    console.log('='.repeat(60));

    // データベース統計情報を表示
    const cardCount = await prisma.card.count({
      where: {
        gameTitle: 'ポケモンカード',
      },
    });
    console.log(`\nデータベース内のポケモンカード総数: ${cardCount}枚`);

    for (const regulation of regulations) {
      const count = await prisma.card.count({
        where: {
          gameTitle: 'ポケモンカード',
          regulationMark: regulation,
        },
      });
      console.log(`  ${regulation}レギュレーション: ${count}枚`);
    }
  } catch (error) {
    console.error('\nエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\nデータベース接続を切断しました');
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });
}

export { importCards };
