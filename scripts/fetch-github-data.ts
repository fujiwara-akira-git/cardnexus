import axios from 'axios';
import fsSync from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env.localファイルを読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// GitHub Raw URLベース
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en';

/**
 * 各レギュレーションに対応するファイル一覧
 */
const REGULATION_FILES = {
  // Gレギュレーション (Scarlet & Violet)
  G: [
    'sv1.json',
    'sv2.json', 
    'sv3.json',
    'sv3pt5.json',
    'sv4.json',
    'sv4pt5.json',
    'sv5.json',
    'sv6.json',
    'sv6pt5.json',
    'sv7.json',
    'sv8.json',
    'sv8pt5.json',
    'sv9.json',
    'sve.json',
    'svp.json'
  ],
  
  // Hレギュレーション (Sword & Shield - 後期)
  H: [
    'swsh9.json',
    'swsh9tg.json',
    'swsh10.json',
    'swsh10tg.json',
    'swsh11.json',
    'swsh11tg.json',
    'swsh12.json',
    'swsh12pt5.json',
    'swsh12pt5gg.json',
    'swsh12tg.json'
  ],
  
  // Iレギュレーション (Sword & Shield - 前期)
  I: [
    'swsh1.json',
    'swsh2.json',
    'swsh3.json',
    'swsh35.json',
    'swsh4.json',
    'swsh45.json',
    'swsh45sv.json',
    'swsh5.json',
    'swsh6.json',
    'swsh7.json',
    'swsh8.json',
    'swshp.json'
  ]
};

/**
 * Pokemon TCG APIのカードデータをCard Nexus形式に正規化
 */
function normalizeCard(card: any, regulation: string, setCode: string): any {
  return {
    id: card.id,
    name: card.name,
    supertype: card.supertype,
    subtypes: card.subtypes || [],
    hp: card.hp ? parseInt(card.hp) : null,
    types: card.types || [],
    evolvesFrom: card.evolvesFrom || null,
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weaknesses: card.weaknesses || [],
    resistances: card.resistances || [],
    retreatCost: card.retreatCost || [],
    convertedRetreatCost: card.convertedRetreatCost || 0,
    rarity: card.rarity || null,
    artist: card.artist || null,
    number: card.number || null,
    setCode: setCode,
    regulation: regulation,
    regulationMark: card.regulationMark || regulation,
    legalities: card.legalities || {},
    nationalPokedexNumbers: card.nationalPokedexNumbers || [],
    flavorText: card.flavorText || null,
    imageUrl: card.images?.large || card.images?.small || null,
    rules: card.rules || [],
    source: 'github',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * GitHubから指定されたファイルのデータを取得
 */
async function fetchSetData(filename: string): Promise<any[]> {
  try {
    const url = `${GITHUB_BASE_URL}/${filename}`;
    console.log(`📥 取得中: ${filename}`);
    
    const response = await axios.get(url, {
      timeout: 60000, // 60秒タイムアウト
    });
    
    const cards = response.data;
    console.log(`✅ ${filename}: ${cards.length}枚取得`);
    
    return cards;
  } catch (error: any) {
    console.error(`❌ ${filename} 取得エラー:`, error.message);
    return [];
  }
}

/**
 * 指定されたレギュレーションのデータを取得
 */
async function fetchRegulationData(regulation: 'G' | 'H' | 'I'): Promise<any[]> {
  console.log(`\n🎯 ${regulation}レギュレーション取得開始...`);
  
  const files = REGULATION_FILES[regulation];
  const allCards: any[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  console.log(`📋 対象ファイル数: ${files.length}`);
  
  for (const filename of files) {
    const setCode = filename.replace('.json', '');
    const cards = await fetchSetData(filename);
    
    if (cards.length > 0) {
      // カードを正規化して追加
      const normalizedCards = cards.map(card => normalizeCard(card, regulation, setCode));
      allCards.push(...normalizedCards);
      successCount++;
    } else {
      errorCount++;
    }
    
    // レート制限回避のため少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 ${regulation}レギュレーション取得完了:`);
  console.log(`✅ 成功: ${successCount}/${files.length} ファイル`);
  console.log(`❌ エラー: ${errorCount}/${files.length} ファイル`);
  console.log(`🎴 総カード数: ${allCards.length}枚`);
  
  return allCards;
}

/**
 * データをファイルに保存
 */
function saveData(regulation: string, cards: any[]): void {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  if (!fsSync.existsSync(dataDir)) {
    fsSync.mkdirSync(dataDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
  const filename = path.join(dataDir, `regulation-${regulation}-github-${timestamp}.json`);
  
  fsSync.writeFileSync(filename, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`\n💾 ${cards.length}枚を ${filename} に保存しました`);
  
  // メインファイルもアップデート
  const mainFile = path.join(dataDir, `regulation-${regulation}-github.json`);
  fsSync.writeFileSync(mainFile, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`📝 メインファイル ${mainFile} を更新しました`);
}

/**
 * すべてのレギュレーションデータを取得
 */
async function fetchAllRegulations(): Promise<void> {
  console.log('🚀 Pokemon TCG GitHub データ取得開始');
  console.log('============================================================');
  
  const startTime = Date.now();
  
  for (const regulation of ['G', 'H', 'I'] as const) {
    try {
      const cards = await fetchRegulationData(regulation);
      if (cards.length > 0) {
        saveData(regulation, cards);
      }
    } catch (error) {
      console.error(`❌ ${regulation}レギュレーション取得失敗:`, error);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n============================================================');
  console.log('🎉 全レギュレーション取得完了');
  console.log(`⏱️  総実行時間: ${duration}分`);
}

/**
 * 単一レギュレーションのみ取得
 */
async function fetchSingleRegulation(regulation: 'G' | 'H' | 'I'): Promise<void> {
  console.log(`🚀 ${regulation}レギュレーション取得開始`);
  console.log('============================================================');
  
  const startTime = Date.now();
  
  try {
    const cards = await fetchRegulationData(regulation);
    if (cards.length > 0) {
      saveData(regulation, cards);
    }
  } catch (error) {
    console.error(`❌ ${regulation}レギュレーション取得失敗:`, error);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  
  console.log('\n============================================================');
  console.log(`🎉 ${regulation}レギュレーション取得完了`);
  console.log(`⏱️  実行時間: ${duration}分`);
}

/**
 * メイン実行
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const regulation = process.argv[2] as 'G' | 'H' | 'I' | undefined;
  
  if (regulation && ['G', 'H', 'I'].includes(regulation)) {
    // 単一レギュレーション取得
    fetchSingleRegulation(regulation);
  } else {
    // 全レギュレーション取得
    fetchAllRegulations();
  }
}