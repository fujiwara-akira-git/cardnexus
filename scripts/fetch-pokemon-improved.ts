/**
 * Pokemon TCG API 接続改善スクリプト
 * 実証済みの安定接続設定を使用
 */

import 'dotenv/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// 実証済み設定（APIレスポンス確認済み）
const API_BASE_URL = process.env.POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;
const MAX_RETRIES = 5; // リトライ回数を削減
const TIMEOUT = 60000; // 1分（実証済み）
const PAGE_SIZE = 20; // 適度なページサイズ
const REQUEST_DELAY = 3000; // 3秒間隔（負荷軽減）

// 取得するレギュレーション
const TARGET_REGULATIONS = ['G', 'H', 'I'];

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
  images?: {
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
 * API接続テスト
 */
async function testConnection(): Promise<boolean> {
  try {
    console.log('🔍 Pokemon TCG API接続テスト中...');
    
    const response = await axios.get<PokemonAPIResponse>(
      `${API_BASE_URL}/cards`,
      {
        params: { pageSize: 1 },
        headers: {
          'User-Agent': 'Card Nexus/1.0',
          'Accept': 'application/json',
          ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
        },
        timeout: TIMEOUT,
      }
    );

    console.log(`✅ 接続成功! サンプルカード: "${response.data.data[0]?.name}"`);
    return true;
  } catch (error) {
    console.error('❌ 接続テスト失敗:', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * 改良版レギュレーション取得
 */
async function fetchRegulationImproved(regulation: string): Promise<PokemonCard[]> {
  const cards: PokemonCard[] = [];
  let page = 1;
  let hasMorePages = true;
  let totalCount = 0;

  console.log(`\n📦 ${regulation}レギュレーション取得開始...`);

  while (hasMorePages && page <= 10) { // 最初は10ページまでテスト
    let retryCount = 0;
    let success = false;

    while (retryCount < MAX_RETRIES && !success) {
      try {
        const response = await axios.get<PokemonAPIResponse>(
          `${API_BASE_URL}/cards`,
          {
            params: {
              q: `regulationMark:${regulation}`,
              page,
              pageSize: PAGE_SIZE,
            },
            headers: {
              'User-Agent': 'Card Nexus Data Fetcher/1.0',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
            },
            timeout: TIMEOUT,
          }
        );

        const { data, page: currentPage, totalCount: total } = response.data;
        if (page === 1) {
          totalCount = total;
          console.log(`📊 ${regulation}レギュレーション総数: ${totalCount}枚`);
        }

        cards.push(...data);
        const progressPercent = ((cards.length / totalCount) * 100).toFixed(1);
        
        console.log(`  ✓ ページ ${currentPage}: ${data.length}枚取得 (合計: ${cards.length}/${totalCount}枚, ${progressPercent}%)`);

        hasMorePages = cards.length < totalCount && data.length === PAGE_SIZE;
        page++;
        success = true;

        // レート制限対策
        if (hasMorePages) {
          console.log(`  ⏳ ${REQUEST_DELAY / 1000}秒待機...`);
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
        }

      } catch (error) {
        retryCount++;
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.code === 'ECONNABORTED' ? 'タイムアウト' : `${status || error.code}`;
          
          console.error(`  ❌ エラー (試行 ${retryCount}/${MAX_RETRIES}): ${message}`);
          
          if (status === 429) {
            console.log('  ⏳ レート制限により30秒待機...');
            await new Promise(resolve => setTimeout(resolve, 30000));
          } else if (retryCount < MAX_RETRIES) {
            const waitTime = retryCount * 5000;
            console.log(`  ⏳ ${waitTime / 1000}秒後にリトライ...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }

        if (retryCount >= MAX_RETRIES) {
          console.error(`  💥 ${regulation}レギュレーション ページ${page} 取得失敗`);
          break; // 失敗したページをスキップして続行
        }
      }
    }
    
    if (!success) {
      console.log(`  ⚠️  ページ${page}をスキップして続行...`);
      page++;
    }
  }

  return cards;
}

/**
 * Card Nexus形式に正規化
 */
function normalizeCard(card: PokemonCard, regulation: string) {
  return {
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    cardType: card.supertype === 'Pokémon' ? 'ポケモン' : 
              card.supertype === 'Trainer' ? 'トレーナー' : 
              card.supertype === 'Energy' ? 'エネルギー' : card.supertype,
    rarity: card.rarity || null,
    regulation: card.regulationMark || regulation,
    effectText: card.abilities?.[0]?.text || card.attacks?.[0]?.text || null,
    cardNumber: card.number,
    expansion: card.set.name,
    hp: card.hp ? parseInt(card.hp) : null,
    types: card.types || [],
    artist: card.artist || null,
    imageUrl: card.images?.large || card.images?.small || null,
    legalFormats: card.legalities,
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weakness: card.weaknesses?.[0]?.type || null,
    resistance: card.resistances?.[0]?.type || null,
    retreatCost: card.convertedRetreatCost || null,
    flavorText: card.flavorText || null,
  };
}

/**
 * ファイルに保存
 */
async function saveCards(regulation: string, cards: PokemonCard[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const normalizedCards = cards.map(card => normalizeCard(card, regulation));
  const filename = path.join(dataDir, `regulation-${regulation}-api.json`);
  
  fs.writeFileSync(filename, JSON.stringify(normalizedCards, null, 2), 'utf8');
  console.log(`💾 ${cards.length}枚を ${filename} に保存しました`);
}

/**
 * メイン処理
 */
async function main() {
  console.log('============================================================');
  console.log('Pokemon TCG API 改良版データ取得スクリプト');
  console.log('============================================================');

  // 接続テスト
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ API接続に失敗しました。ネットワークを確認してください。');
    process.exit(1);
  }

  // レギュレーション別取得
  for (const regulation of TARGET_REGULATIONS) {
    try {
      const cards = await fetchRegulationImproved(regulation);
      if (cards.length > 0) {
        await saveCards(regulation, cards);
      } else {
        console.log(`⚠️  ${regulation}レギュレーションのカードが見つかりませんでした`);
      }
    } catch (error) {
      console.error(`❌ ${regulation}レギュレーション取得失敗:`, error);
      continue; // 次のレギュレーションに進む
    }

    // レギュレーション間の待機
    if (regulation !== TARGET_REGULATIONS[TARGET_REGULATIONS.length - 1]) {
      console.log('\n⏳ 次のレギュレーション前に10秒待機...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log('\n============================================================');
  console.log('✅ データ取得完了!');
  console.log('============================================================');
}

main().catch(error => {
  console.error('💥 スクリプト実行エラー:', error);
  process.exit(1);
});