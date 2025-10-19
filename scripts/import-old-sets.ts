import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  abilities?: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  attacks?: Array<{
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: {
      standard?: string;
      expanded?: string;
    };
    ptcgoCode?: string;
    releaseDate: string;
    updatedAt: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: {
    standard?: string;
    expanded?: string;
  };
  regulationMark?: string;
  images: {
    small: string;
    large: string;
  };
}

interface PokemonAPIResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

/**
 * 指定されたセットのカードデータを取得
 */
async function fetchSetCards(setId: string): Promise<PokemonCard[]> {
  const cards: PokemonCard[] = [];
  let page = 1;
  const pageSize = 100;

  console.log(`${setId}のカードデータを取得中...`);

  while (true) {
    try {
      const response = await axios.get<PokemonAPIResponse>(
        'https://api.pokemontcg.io/v2/cards',
        {
          params: {
            q: `set.id:${setId}`,
            page,
            pageSize,
          },
          headers: {
            'User-Agent': 'Card Nexus Data Fetcher/1.0',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );

      const { data, totalCount } = response.data;
      cards.push(...data);

      console.log(`${setId}: ${cards.length}/${totalCount}枚取得`);

      if (data.length < pageSize) {
        break; // 最後のページ
      }

      page++;
    } catch (error) {
      console.error(`${setId}の取得エラー:`, error);
      throw error;
    }
  }

  return cards;
}

/**
 * カードデータをCardテーブル形式に変換
 */
function transformCardData(card: PokemonCard) {
  return {
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    imageUrl: card.images.large,
    rarity: card.rarity || null,
    effectText: card.flavorText || null,
    cardNumber: card.number,
    expansion: card.set.name,
    regulationMark: card.regulationMark || null,
    cardType: card.supertype,
    hp: card.hp ? parseInt(card.hp) : null,
    types: card.types ? card.types.join(', ') : null,
    evolveFrom: card.evolvesFrom || null,
    artist: card.artist || null,
    subtypes: card.subtypes ? card.subtypes.join(', ') : null,
    releaseDate: card.set.releaseDate,

    // JSON型フィールド
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weaknesses: card.weaknesses || [],
    resistances: card.resistances || [],
    retreatCost: card.retreatCost || [],
    legalities: card.legalities || {},
    rules: [],
    nationalPokedexNumbers: card.nationalPokedexNumbers || [],
    source: 'pokemon-tcg-api',
  };
}

/**
 * 指定されたセットのカードをデータベースにインポート
 */
async function importSetCards(setId: string): Promise<void> {
  console.log(`🚀 ${setId}カードインポート開始`);
  console.log('============================================================');

  const startTime = Date.now();

  // 既存のカード数を確認
  const existingCount = await prisma.card.count();
  console.log(`📊 既存カード数: ${existingCount}枚`);

  // セットのデータを取得
  const setCards = await fetchSetCards(setId);
  console.log(`📥 ${setId}から${setCards.length}枚のカードを取得`);

  // カードをインポート
  let importedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const card of setCards) {
    try {
      const cardData = transformCardData(card);

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
    } catch (error) {
      console.error(`❌ ${card.name}のインポートエラー:`, error);
      errorCount++;
    }
  }

  // 最終結果
  const finalCount = await prisma.card.count();
  const newCards = finalCount - existingCount;

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n============================================================');
  console.log(`🎉 ${setId}インポート完了`);
  console.log(`📊 新規作成: ${importedCount}枚`);
  console.log(`🔄 更新: ${updatedCount}枚`);
  console.log(`❌ エラー: ${errorCount}枚`);
  console.log(`📊 変更: ${newCards}枚`);
  console.log(`📊 総カード数: ${finalCount}枚`);
  console.log(`⏱️  実行時間: ${duration}秒`);
}

/**
 * メイン処理 - デッキで使用されているセットをインポート
 */
async function main(): Promise<void> {
  // デッキで使用されているセットのリスト
  const setsToImport = [
    'base2', // Jungle
    'base3', // Base Set 2
    'base4', // 1st Edition
    'base5', // Team Rocket
    'base6', // No. 1 Trainer
    'bw1',   // Black & White
    'bw2',   // Emerging Powers
    'bw3',   // Noble Victories
    'bw10',  // Plasma Blast
    'gym1',  // Gym Heroes
    'neo1',  // Base Set 2
    'hgss1', // HeartGold & SoulSilver
  ];

  console.log('🎯 デッキで使用されているセットをインポートします');
  console.log(`📋 対象セット: ${setsToImport.join(', ')}`);
  console.log('============================================================');

  for (const setId of setsToImport) {
    try {
      await importSetCards(setId);
      console.log(''); // セット間の区切り
    } catch (error) {
      console.error(`❌ ${setId}のインポート失敗:`, error);
    }
  }

  console.log('🎉 全セットのインポート完了');
}

/**
 * 単一セットをインポート（コマンドライン引数で指定）
 */
async function importSingleSet(): Promise<void> {
  const setId = process.argv[2];
  if (!setId) {
    console.error('使用法: npx tsx import-old-sets.ts <setId>');
    console.error('例: npx tsx import-old-sets.ts base2');
    process.exit(1);
  }

  await importSetCards(setId);
}

// 実行
if (process.argv[2]) {
  // コマンドライン引数がある場合は単一セットをインポート
  importSingleSet();
} else {
  // 引数がない場合は全セットをインポート
  main();
}