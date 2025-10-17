/**
 * Pokemon TCG API チャンク取得戦略
 * 公式APIの制限に基づく最適化された取得システム
 */

import 'dotenv/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;

// 公式ドキュメントに基づく最適設定
const CHUNK_SIZE = 10; // 小さなチャンクで確実に取得
const TIMEOUT = 20000; // 20秒（短縮）
const REQUEST_DELAY = 10000; // 10秒間隔（レート制限対策）
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 5; // 5チャンクごとに保存

interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  abilities?: unknown[];
  attacks?: unknown[];
  weaknesses?: unknown[];
  resistances?: unknown[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: unknown;
    ptcgoCode?: string;
    releaseDate: string;
    updatedAt: string;
    images: any;
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: any;
  regulationMark?: string;
  images?: any;
}

interface PokemonAPIResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

/**
 * チャンク取得関数
 */
async function fetchChunk(regulation: string, page: number): Promise<PokemonCard[]> {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`📦 チャンク ${page} 取得中... (試行 ${retryCount + 1}/${MAX_RETRIES})`);
      
      const response = await axios.get<PokemonAPIResponse>(
        `${API_BASE_URL}/cards`,
        {
          params: {
            q: `regulationMark:${regulation}`,
            page,
            pageSize: CHUNK_SIZE,
          },
          headers: {
            'User-Agent': 'Card Nexus Chunked Fetcher/1.0',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
          },
          timeout: TIMEOUT,
        }
      );

      const { data, totalCount } = response.data;
      console.log(`✅ チャンク ${page}: ${data.length}枚取得 (総数: ${totalCount})`);
      
      return data;
      
    } catch (error) {
      retryCount++;
      
      if (axios.isAxiosError(error)) {
        const message = error.code === 'ECONNABORTED' ? 'タイムアウト' : 
                       `${error.response?.status || error.code}`;
        console.log(`❌ エラー (試行 ${retryCount}/${MAX_RETRIES}): ${message}`);
        
        if (retryCount < MAX_RETRIES) {
          const waitTime = retryCount * 5000;
          console.log(`⏳ ${waitTime / 1000}秒後にリトライ...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
  }
  
  console.log(`💥 チャンク ${page} の取得に失敗しました`);
  return [];
}

/**
 * 進捗保存関数
 */
function saveProgress(regulation: string, cards: PokemonCard[], chunkNumber: number): void {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const normalizedCards = cards.map(card => ({
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    cardType: card.supertype === 'Pokémon' ? 'ポケモン' : 
              card.supertype === 'Trainer' ? 'トレーナー' : 
              card.supertype === 'Energy' ? 'エネルギー' : card.supertype,
    rarity: card.rarity || null,
    regulation: card.regulationMark || regulation,
    effectText: (card.abilities?.[0] as any)?.text || (card.attacks?.[0] as any)?.text || null,
    cardNumber: card.number,
    expansion: card.set.name,
    hp: card.hp ? parseInt(card.hp) : null,
    types: card.types || [],
    artist: card.artist || null,
    imageUrl: (card.images as any)?.large || (card.images as any)?.small || null,
    legalFormats: card.legalities,
    abilities: card.abilities || [],
    attacks: card.attacks || [],
    weakness: (card.weaknesses?.[0] as any)?.type || null,
    resistance: (card.resistances?.[0] as any)?.type || null,
    retreatCost: card.convertedRetreatCost || null,
    flavorText: card.flavorText || null,
  }));

  const filename = path.join(dataDir, `regulation-${regulation}-chunk-${chunkNumber}.json`);
  fs.writeFileSync(filename, JSON.stringify(normalizedCards, null, 2), 'utf8');
  
  console.log(`💾 チャンク ${chunkNumber}: ${cards.length}枚を保存`);
}

/**
 * チャンクを統合して最終ファイルを作成
 */
function mergeChunks(regulation: string): void {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  const allCards: any[] = [];
  
  // チャンクファイルを収集
  const files = fs.readdirSync(dataDir)
    .filter(file => file.startsWith(`regulation-${regulation}-chunk-`))
    .sort((a, b) => {
      const numA = parseInt(a.match(/chunk-(\d+)/)![1]);
      const numB = parseInt(b.match(/chunk-(\d+)/)![1]);
      return numA - numB;
    });
  
  for (const file of files) {
    const chunkData = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    allCards.push(...chunkData);
  }
  
  // 最終ファイルを作成
  const finalFile = path.join(dataDir, `regulation-${regulation}-chunked.json`);
  fs.writeFileSync(finalFile, JSON.stringify(allCards, null, 2), 'utf8');
  
  console.log(`🎉 統合完了: ${allCards.length}枚を ${finalFile} に保存`);
  
  // チャンクファイルを削除
  for (const file of files) {
    fs.unlinkSync(path.join(dataDir, file));
  }
  console.log(`🧹 ${files.length}個のチャンクファイルを削除`);
}

/**
 * メイン取得関数
 */
async function fetchRegulationByChunks(regulation: string): Promise<void> {
  console.log('============================================================');
  console.log(`Pokemon TCG API チャンク取得: ${regulation}レギュレーション`);
  console.log('============================================================\n');

  let page = 1;
  let allCards: PokemonCard[] = [];
  let chunksSaved = 0;
  
  try {
    while (true) {
      const chunkCards = await fetchChunk(regulation, page);
      
      if (chunkCards.length === 0) {
        console.log(`📄 ページ ${page}: データなし - 取得完了\n`);
        break;
      }
      
      allCards.push(...chunkCards);
      
      // 定期保存
      if (page % SAVE_INTERVAL === 0) {
        saveProgress(regulation, allCards.slice(chunksSaved * CHUNK_SIZE * SAVE_INTERVAL), page);
        chunksSaved++;
      }
      
      const progress = allCards.length;
      console.log(`📊 進捗: ${progress}枚取得済み\n`);
      
      // チャンクサイズ未満の場合は最後のページ
      if (chunkCards.length < CHUNK_SIZE) {
        console.log(`📄 最終チャンク検出 - 取得完了\n`);
        break;
      }
      
      page++;
      
      // レート制限対策の待機
      console.log(`⏳ ${REQUEST_DELAY / 1000}秒待機中...\n`);
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
    
    // 残りのカードを保存
    if (allCards.length > chunksSaved * CHUNK_SIZE * SAVE_INTERVAL) {
      saveProgress(regulation, allCards.slice(chunksSaved * CHUNK_SIZE * SAVE_INTERVAL), page);
    }
    
    // チャンクを統合
    mergeChunks(regulation);
    
    console.log('\n============================================================');
    console.log(`✅ ${regulation}レギュレーション取得完了: ${allCards.length}枚`);
    console.log('============================================================');

  } catch (error) {
    console.error('💥 取得中にエラーが発生:', error);
    
    // エラー時も部分的なデータを保存
    if (allCards.length > 0) {
      console.log(`🛟 ${allCards.length}枚の部分データを保存中...`);
      saveProgress(regulation, allCards, page);
    }
  }
}

/**
 * 実行
 */
const targetRegulation = process.argv[2] || 'G';
fetchRegulationByChunks(targetRegulation);