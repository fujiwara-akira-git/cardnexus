import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  set?: {
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
  setCode?: string;
  regulation?: string;
  regulationMark?: string;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: {
    standard?: string;
    expanded?: string;
  };
  images?: {
    small: string;
    large: string;
  };
  imageUrl?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  rules?: string[];
}

/**
 * カードデータをCardテーブル形式に変換
 */
function transformCardData(card: PokemonCard) {
  // 画像URLの取得（images.largeまたはimageUrlのどちらか）
  const imageUrl = card.images?.large || card.imageUrl || '';

  // セット情報の取得（setオブジェクトまたは個別フィールド）
  const setName = card.set?.name || card.setCode || 'Unknown Set';
  const releaseDate = card.set?.releaseDate || card.createdAt || new Date().toISOString().split('T')[0];

  return {
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    imageUrl: imageUrl,
    rarity: card.rarity || null,
    effectText: card.flavorText || null,
    cardNumber: card.number,
    expansion: setName,
    regulationMark: card.regulationMark || card.regulation || null,
    cardType: card.supertype,
    hp: card.hp ? parseInt(card.hp) : null,
    types: card.types ? card.types.join(', ') : null,
    evolveFrom: card.evolvesFrom || null,
    artist: card.artist || null,
    subtypes: card.subtypes ? card.subtypes.join(', ') : null,
    releaseDate: releaseDate,

    // JSON型フィールド
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weaknesses: card.weaknesses || [],
    resistances: card.resistances || [],
    retreatCost: card.retreatCost || [],
    legalities: card.legalities || {},
    rules: card.rules || [],
    nationalPokedexNumbers: card.nationalPokedexNumbers || [],
    source: card.source || 'github-json',
  };
}

/**
 * JSONファイルからカードをデータベースにインポート
 */
async function importCardsFromJson(jsonFilePath: string): Promise<void> {
  const fileName = path.basename(jsonFilePath);
  console.log(`🚀 ${fileName}からカードインポート開始`);
  console.log('============================================================');

  const startTime = Date.now();

  // 既存のカード数を確認
  const existingCount = await prisma.card.count();
  console.log(`📊 既存カード数: ${existingCount}枚`);

  // JSONファイルを読み込み
  const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
  const parsedData = JSON.parse(jsonData);

  // JSONの構造をチェック（直接配列かdataプロパティがあるか）
  let cards: PokemonCard[];
  if (Array.isArray(parsedData)) {
    cards = parsedData;
  } else if (parsedData.data && Array.isArray(parsedData.data)) {
    cards = parsedData.data;
  } else {
    throw new Error('Invalid JSON structure: expected array or {data: array}');
  }

  console.log(`📥 ${fileName}から${cards.length}枚のカードを取得`);

  // カードをインポート
  let importedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  const batchSize = 50; // バッチサイズをさらに小さくする

  console.log(`🔄 ${cards.length}枚のカードを${batchSize}枚ずつ処理します...`);

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    console.log(`📦 バッチ ${Math.floor(i / batchSize) + 1}/${Math.ceil(cards.length / batchSize)} を処理中...`);

    for (const card of batch) {
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

    // 進捗を表示
    const progress = Math.round(((i + batch.length) / cards.length) * 100);
    console.log(`📊 進捗: ${progress}% (${i + batch.length}/${cards.length})`);
  }

  // 最終結果
  const finalCount = await prisma.card.count();
  const newCards = finalCount - existingCount;

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n============================================================');
  console.log(`🎉 ${fileName}インポート完了`);
  console.log(`📊 新規作成: ${importedCount}枚`);
  console.log(`🔄 更新: ${updatedCount}枚`);
  console.log(`❌ エラー: ${errorCount}枚`);
  console.log(`📊 変更: ${newCards}枚`);
  console.log(`📊 総カード数: ${finalCount}枚`);
  console.log(`⏱️  実行時間: ${duration}秒`);
}

/**
 * メイン処理 - 古いセットのJSONファイルをインポート
 */
async function main(): Promise<void> {
  const dataDir = path.join(__dirname, '..', 'data', 'pokemon-cards');

  // インポートする古いセットのファイル
  const oldSetFiles = [
    'regulation-G-github.json',  // 最新のデータ
    'regulation-H-github.json',
    'regulation-I-github.json',
  ];

  console.log('🎯 古いセットのJSONファイルからインポートします');
  console.log('============================================================');

  for (const fileName of oldSetFiles) {
    const filePath = path.join(dataDir, fileName);

    if (fs.existsSync(filePath)) {
      try {
        await importCardsFromJson(filePath);
        console.log(''); // ファイル間の区切り
      } catch (error) {
        console.error(`❌ ${fileName}のインポート失敗:`, error);
      }
    } else {
      console.log(`⚠️  ${fileName}が見つかりません`);
    }
  }

  console.log('🎉 全ファイルのインポート完了');
}

/**
 * 単一ファイルをインポート（コマンドライン引数で指定）
 */
async function importSingleFile(): Promise<void> {
  const fileName = process.argv[2];
  if (!fileName) {
    console.error('使用法: npx tsx import-from-json.ts <filename>');
    console.error('例: npx tsx import-from-json.ts regulation-G-github.json');
    process.exit(1);
  }

  const filePath = path.join(__dirname, '..', 'data', 'pokemon-cards', fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  await importCardsFromJson(filePath);
}

// 実行
if (process.argv[2]) {
  // コマンドライン引数がある場合は単一ファイルをインポート
  importSingleFile();
} else {
  // 引数がない場合は全ファイルをインポート
  main();
}