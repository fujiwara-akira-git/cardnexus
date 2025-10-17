/**
 * Pokemon TCG API Gレギュレーション特化取得スクリプト
 * 動作確認済みのGレギュレーション（1,639枚）を取得
 */

import 'dotenv/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;
const MAX_RETRIES = 5; // リトライ回数増加
const TIMEOUT = 45000; // 45秒に延長（バックグラウンド実行用）
const PAGE_SIZE = 25; // ページサイズ削減で安定性向上
const REQUEST_DELAY = 5000; // 5秒間隔（負荷軽減）

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

async function fetchGRegulation(): Promise<PokemonCard[]> {
  const cards: PokemonCard[] = [];
  let page = 1;
  let totalCount = 0;

  console.log('🎯 Gレギュレーション（1,639枚）取得開始...\n');

  try {
    while (true) {
      let success = false;
      let retryCount = 0;

      while (retryCount < MAX_RETRIES && !success) {
        try {
          console.log(`📄 ページ ${page} 取得中...`);
          
          const response = await axios.get<PokemonAPIResponse>(
            `${API_BASE_URL}/cards`,
            {
              params: {
                q: 'regulationMark:G',
                page,
                pageSize: PAGE_SIZE,
              },
              headers: {
                'User-Agent': 'Card Nexus/1.0',
                'Accept': 'application/json',
                ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
              },
              timeout: TIMEOUT,
            }
          );

          const { data, totalCount: total } = response.data;
          
          if (page === 1) {
            totalCount = total;
            console.log(`📊 総カード数: ${totalCount}枚\n`);
          }

          cards.push(...data);
          const progress = ((cards.length / totalCount) * 100).toFixed(1);
          
          console.log(`✅ ページ ${page}: ${data.length}枚取得 (合計: ${cards.length}/${totalCount}枚, ${progress}%)`);

          if (data.length < PAGE_SIZE || cards.length >= totalCount) {
            console.log(`\n🎉 全データ取得完了! 総数: ${cards.length}枚`);
            break;
          }

          page++;
          success = true;

          // 次のページまで待機
          console.log(`⏳ ${REQUEST_DELAY / 1000}秒待機...\n`);
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));

        } catch (error) {
          retryCount++;
          
          if (axios.isAxiosError(error)) {
            const message = error.code === 'ECONNABORTED' ? 'タイムアウト' : 
                           `${error.response?.status || error.code}`;
            console.log(`❌ エラー (試行 ${retryCount}/${MAX_RETRIES}): ${message}`);
            
            if (retryCount < MAX_RETRIES) {
              const waitTime = retryCount * 3000;
              console.log(`⏳ ${waitTime / 1000}秒後にリトライ...\n`);
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
    console.error('❌ 予期しないエラー:', error);
  }

  return cards;
}

function normalizeCard(card: PokemonCard) {
  return {
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    cardType: card.supertype === 'Pokémon' ? 'ポケモン' : 
              card.supertype === 'Trainer' ? 'トレーナー' : 
              card.supertype === 'Energy' ? 'エネルギー' : card.supertype,
    rarity: card.rarity || null,
    regulation: card.regulationMark || 'G',
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

async function saveCards(cards: PokemonCard[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const normalizedCards = cards.map(normalizeCard);
  const filename = path.join(dataDir, 'regulation-G-full.json');
  
  fs.writeFileSync(filename, JSON.stringify(normalizedCards, null, 2), 'utf8');
  console.log(`\n💾 ${cards.length}枚のGレギュレーションカードを ${filename} に保存しました`);
}

async function main() {
  console.log('============================================================');
  console.log('Pokemon TCG API - Gレギュレーション大量取得');
  console.log('============================================================\n');

  try {
    const cards = await fetchGRegulation();
    
    if (cards.length > 0) {
      await saveCards(cards);
      console.log('\n============================================================');
      console.log(`✅ Gレギュレーション取得成功: ${cards.length}枚`);
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