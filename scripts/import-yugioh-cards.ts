/**
 * 遊戯王カードデータインポートスクリプト
 * JSONファイルからデータベースにカード情報を保存
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface NormalizedYuGiOhCard {
  apiId: string;
  name: string;
  gameTitle: string;
  imageUrl: string;
  rarity: string | null;
  effectText: string;
  cardNumber: string;
  expansion: string | null;
  cardType: string;
  cardCategory: string; // モンスター/魔法/罠
  attribute: string | null;
  race: string;
  level: number | null;
  rank: number | null;
  link: number | null;
  linkMarkers: string | null;
  pendulumScale: number | null;
  atk: number | null;
  def: number | null;
  archetype: string | null;
  banStatus: string | null;
}

/**
 * JSONファイルからカードデータを読み込む
 */
function loadCardsFromFile(): NormalizedYuGiOhCard[] {
  const filePath = path.join(__dirname, '..', 'data', 'yugioh-cards', 'all-cards.json');
  
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
async function importCards(): Promise<number> {
  const cards = loadCardsFromFile();
  
  if (cards.length === 0) {
    console.log('データが見つかりません');
    return 0;
  }

  console.log(`\n${cards.length}枚の遊戯王カードをインポート中...`);

  let importCount = 0;
  let updateCount = 0;
  let skipCount = 0;

  for (const card of cards) {
    try {
      // apiIdで既存カードをチェック
      const existing = await prisma.card.findFirst({
        where: {
          apiId: card.apiId,
          gameTitle: '遊戯王',
        },
      });

      if (existing) {
        // 既存カードを更新
        await prisma.card.update({
          where: { id: existing.id },
          data: {
            name: card.name,
            imageUrl: card.imageUrl,
            rarity: card.rarity,
            effectText: card.effectText,
            cardNumber: card.cardNumber,
            expansion: card.expansion,
            cardType: card.cardType,
            
            // 遊戯王固有フィールド（将来的にスキーマ拡張時）
            // attribute: card.attribute,
            // race: card.race,
            // level: card.level,
            // atk: card.atk,
            // def: card.def,
            
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
            cardType: card.cardType,
            
            // 遊戯王固有フィールド（将来的にスキーマ拡張時）
            // attribute: card.attribute,
            // race: card.race,
            // level: card.level,
            // atk: card.atk,
            // def: card.def,
          },
        });
        importCount++;
      }

      // 進捗表示
      if ((importCount + updateCount + skipCount) % 500 === 0) {
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
  console.log('遊戯王カードデータインポートスクリプト');
  console.log('='.repeat(60));

  try {
    // データベース接続確認
    await prisma.$connect();
    console.log('\nデータベースに接続しました');

    const totalImported = await importCards();

    // サマリー表示
    console.log('\n' + '='.repeat(60));
    console.log('インポート完了');
    console.log(`  合計: ${totalImported}枚のカードを保存しました`);
    console.log('='.repeat(60));

    // データベース統計情報を表示
    const yugiohCount = await prisma.card.count({
      where: {
        gameTitle: '遊戯王',
      },
    });
    
    const pokemonCount = await prisma.card.count({
      where: {
        gameTitle: 'ポケモンカード',
      },
    });

    console.log('\n📊 データベース統計:');
    console.log(`  遊戯王カード: ${yugiohCount}枚`);
    console.log(`  ポケモンカード: ${pokemonCount}枚`);
    console.log(`  総カード数: ${yugiohCount + pokemonCount}枚`);

    // カテゴリ別統計（将来の拡張用）
    const monsterCount = await prisma.card.count({
      where: {
        gameTitle: '遊戯王',
        cardType: { contains: 'モンスター' },
      },
    });

    const spellCount = await prisma.card.count({
      where: {
        gameTitle: '遊戯王',
        cardType: '魔法カード',
      },
    });

    const trapCount = await prisma.card.count({
      where: {
        gameTitle: '遊戯王',
        cardType: '罠カード',
      },
    });

    console.log('\n📋 遊戯王カードカテゴリ別:');
    console.log(`  モンスター: ${monsterCount}枚`);
    console.log(`  魔法: ${spellCount}枚`);
    console.log(`  罠: ${trapCount}枚`);

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
