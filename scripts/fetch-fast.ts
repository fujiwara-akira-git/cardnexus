/**
 * Pokemon TCG API 高速取得スクリプト（APIキー使用）
 * レート制限緩和による高速データ取得
 */

import 'dotenv/config';
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

// APIキーを直接読み込み（環境変数が効かない場合の対策）
const API_KEY = process.env.POKEMON_TCG_API_KEY || '2a28040b-b402-4fcd-ab89-dfc75b03ffcc';

const API_BASE_URL = process.env.POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2';

// APIキー使用時の最適化設定
const WITH_API_KEY = {
  PAGE_SIZE: 100,        // 最大ページサイズ
  REQUEST_DELAY: 1000,   // 1秒間隔（高速）
  TIMEOUT: 30000,        // 30秒
  MAX_RETRIES: 3,        // 少ないリトライ回数
};

// APIキーなし時の安全設定
const WITHOUT_API_KEY = {
  PAGE_SIZE: 25,         // 小さなページサイズ
  REQUEST_DELAY: 5000,   // 5秒間隔（安全）
  TIMEOUT: 45000,        // 45秒
  MAX_RETRIES: 5,        // 多めのリトライ回数
};

// 使用する設定を決定
const config = API_KEY ? WITH_API_KEY : WITHOUT_API_KEY;

console.log(`🔑 APIキー: ${API_KEY ? '使用中（高速モード）' : '未設定（安全モード）'}`);
console.log(`⚙️  設定: ページサイズ${config.PAGE_SIZE}枚, ${config.REQUEST_DELAY/1000}秒間隔`);

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
    images: unknown;
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: unknown;
  regulationMark?: string;
  images?: unknown;
}

interface PokemonAPIResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

/**
 * 高速レギュレーション取得
 */
async function fetchRegulationFast(regulation: string): Promise<PokemonCard[]> {
  const cards: PokemonCard[] = [];
  let page = 1;
  let totalCount = 0;
  let startTime = Date.now();

  console.log(`\n🚀 ${regulation}レギュレーション高速取得開始...`);

  try {
    while (true) {
      let retryCount = 0;
      let success = false;

      while (retryCount < config.MAX_RETRIES && !success) {
        try {
          console.log(`📄 ページ ${page} 取得中... ${retryCount > 0 ? `(リトライ ${retryCount})` : ''}`);
          
          const response = await axios.get<PokemonAPIResponse>(
            `${API_BASE_URL}/cards`,
            {
              params: {
                q: `regulationMark:${regulation}`,
                page,
                pageSize: config.PAGE_SIZE,
              },
              headers: {
                'User-Agent': 'Card Nexus Fast Fetcher/2.0',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Cache-Control': 'no-cache',
                ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
              },
              timeout: config.TIMEOUT,
            }
          );

          const { data, totalCount: total } = response.data;
          
          if (page === 1) {
            totalCount = total;
            console.log(`📊 総カード数: ${totalCount}枚`);
            
            // 予想完了時間を計算
            const estimatedPages = Math.ceil(totalCount / config.PAGE_SIZE);
            const estimatedTime = (estimatedPages * (config.REQUEST_DELAY + 2000)) / 1000 / 60; // 分
            console.log(`⏱️  予想完了時間: 約${estimatedTime.toFixed(1)}分`);
          }

          cards.push(...data);
          const progress = ((cards.length / totalCount) * 100).toFixed(1);
          const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
          
          console.log(`✅ ページ ${page}: ${data.length}枚取得 (合計: ${cards.length}/${totalCount}枚, ${progress}%, ${elapsed}分経過)`);

          if (data.length < config.PAGE_SIZE || cards.length >= totalCount) {
            console.log(`\n🎉 全データ取得完了!`);
            break;
          }

          page++;
          success = true;

          // レート制限対策の待機
          if (cards.length < totalCount) {
            console.log(`⏳ ${config.REQUEST_DELAY / 1000}秒待機...\n`);
            await new Promise(resolve => setTimeout(resolve, config.REQUEST_DELAY));
          }

        } catch (error) {
          retryCount++;
          
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.code === 'ECONNABORTED' ? 'タイムアウト' : 
                           status === 429 ? 'レート制限' :
                           `${status || error.code}`;
            
            console.log(`❌ エラー (試行 ${retryCount}/${config.MAX_RETRIES}): ${message}`);
            
            if (status === 429) {
              const waitTime = API_KEY ? 10000 : 30000; // APIキー有無で待機時間調整
              console.log(`⏳ レート制限のため${waitTime / 1000}秒待機...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            } else if (retryCount < config.MAX_RETRIES) {
              const waitTime = retryCount * 3000;
              console.log(`⏳ ${waitTime / 1000}秒後にリトライ...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
        }
      }

      if (!success) {
        console.log(`⚠️ ページ ${page} の取得に失敗しました。現在までの取得分を保存します。`);
        break;
      }
    }

  } catch (error) {
    console.error('💥 予期しないエラー:', error);
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`⏱️  総取得時間: ${totalTime}分`);
  
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
  };
}

/**
 * ファイルに保存
 */
async function saveCards(regulation: string, cards: PokemonCard[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  if (!fsSync.existsSync(dataDir)) {
    fsSync.mkdirSync(dataDir, { recursive: true });
  }

  const normalizedCards = cards.map(card => normalizeCard(card, regulation));
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
  const filename = path.join(dataDir, `regulation-${regulation}-fast-${timestamp}.json`);
  
  fsSync.writeFileSync(filename, JSON.stringify(normalizedCards, null, 2), 'utf8');
  console.log(`\n💾 ${cards.length}枚を ${filename} に保存しました`);
  
  // メインファイルもアップデート
  const mainFile = path.join(dataDir, `regulation-${regulation}.json`);
  fsSync.writeFileSync(mainFile, JSON.stringify(normalizedCards, null, 2), 'utf8');
  console.log(`📝 メインファイル ${mainFile} を更新しました`);
}

/**
 * メイン処理
 */
async function main() {
  console.log('============================================================');
  console.log('Pokemon TCG API 高速取得スクリプト');
  console.log('============================================================');

  const targetRegulation = process.argv[2] || 'G';
  
  if (!['G', 'H', 'I'].includes(targetRegulation)) {
    console.error('❌ 無効なレギュレーション。G, H, I のいずれかを指定してください。');
    process.exit(1);
  }

  console.log(`🎯 対象: ${targetRegulation}レギュレーション`);

  try {
    const cards = await fetchRegulationFast(targetRegulation);
    
    if (cards.length > 0) {
      await saveCards(targetRegulation, cards);
      
      console.log('\n============================================================');
      console.log(`✅ ${targetRegulation}レギュレーション取得成功: ${cards.length}枚`);
      
      if (API_KEY) {
        console.log('🚀 APIキー使用により高速取得が完了しました！');
      } else {
        console.log('⚠️  APIキー未設定のため安全モードで動作しました');
        console.log('   高速化にはAPIキーの設定をお勧めします');
      }
      
      console.log('============================================================');
    } else {
      console.log('❌ カードが取得できませんでした');
    }

  } catch (error) {
    console.error('💥 スクリプトエラー:', error);
    process.exit(1);
  }
}

main();