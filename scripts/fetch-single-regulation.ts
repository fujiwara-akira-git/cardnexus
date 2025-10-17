/**
 * 段階的ポケモンカードデータ取得スクリプト
 * 1つのレギュレーションに特化した安定的取得
 */

import 'dotenv/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Pokemon TCG API 設定（超安定性重視）
const API_BASE_URL = process.env.POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;
const MAX_RETRIES = 25; // 最大リトライ回数
const TIMEOUT = 300000; // 5分のタイムアウト
const PAGE_SIZE = 10; // 非常に小さなページサイズで安定性を最優先
const REQUEST_DELAY = 15000; // 15秒間隔で負荷を最小化

// コマンドライン引数から対象レギュレーションを取得
const targetRegulation = process.argv[2] || 'G';

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
 * 単一レギュレーションのカードを段階的に取得
 */
async function fetchSingleRegulation(regulation: string): Promise<PokemonCard[]> {
  const cards: PokemonCard[] = [];
  let page = 1;
  let hasMorePages = true;

  console.log(`\\n${regulation}レギュレーションの段階的取得を開始...`);

  while (hasMorePages) {
    let retryCount = 0;
    let success = false;

    while (retryCount < MAX_RETRIES && !success) {
      try {
        console.log(`\\n  ページ ${page} 取得中... (${retryCount > 0 ? \`リトライ ${retryCount}\` : '初回'})`);
        
        const response = await axios.get<PokemonAPIResponse>(
          \`\${API_BASE_URL}/cards\`,
          {
            params: {
              q: \`regulationMark:\${regulation}\`,
              page,
              pageSize: PAGE_SIZE,
            },
            headers: {
              'User-Agent': 'Card Nexus Fetcher/1.0',
              'Accept': 'application/json',
              'Connection': 'keep-alive',
              ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
            },
            timeout: TIMEOUT,
          }
        );

        const { data, page: currentPage, totalCount } = response.data;
        cards.push(...data);

        const progressPercent = ((cards.length / totalCount) * 100).toFixed(1);
        console.log(\`  ✓ ページ \${currentPage}: \${data.length}枚取得 (合計: \${cards.length}/\${totalCount}枚, \${progressPercent}%)\`);

        hasMorePages = cards.length < totalCount;
        page++;
        success = true;

        // 次のリクエスト前の待機
        if (hasMorePages) {
          console.log(\`  ⏳ \${REQUEST_DELAY / 1000}秒待機中...\`);
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
        }
      } catch (error) {
        retryCount++;
        
        if (axios.isAxiosError(error)) {
          const errorMessage = error.code === 'ECONNABORTED' 
            ? 'タイムアウト' 
            : \`\${error.response?.status || error.code}\`;
          
          console.error(\`  ❌ エラー (試行 \${retryCount}/\${MAX_RETRIES}): \${errorMessage}\`);
          
          if (error.response?.status === 429) {
            const waitTime = 60000; // レート制限時は1分待機
            console.log(\`  ⏳ レート制限回避のため\${waitTime / 1000}秒待機...\`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else if (retryCount < MAX_RETRIES) {
            const waitTime = Math.min(retryCount * 15000, 120000); // 最大2分の指数バックオフ
            console.log(\`  ⏳ \${waitTime / 1000}秒後にリトライ...\`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } else {
          console.error(\`  ❌ 予期しないエラー:\`, error);
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error(\`\${regulation}レギュレーションのページ\${page}の取得に失敗しました（\${MAX_RETRIES}回リトライ）\`);
        }
      }
    }
  }

  return cards;
}

/**
 * データをファイルに保存
 */
async function saveToFile(regulation: string, cards: PokemonCard[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data', 'pokemon-cards');
  
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Card Nexus形式に変換
  const normalizedCards = cards.map(card => ({
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    cardType: card.supertype === 'Pokémon' ? 'ポケモン' : card.supertype,
    rarity: card.rarity || null,
    regulation: card.regulationMark || regulation,
    effectText: card.abilities?.[0]?.text || null,
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
  }));

  const filename = path.join(dataDir, \`regulation-\${regulation}.json\`);
  fs.writeFileSync(filename, JSON.stringify(normalizedCards, null, 2), 'utf8');
  
  console.log(\`\\n📁 \${cards.length}枚のカードを \${filename} に保存しました\`);
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('============================================================');
    console.log(\`段階的ポケモンカードデータ取得スクリプト\`);
    console.log(\`対象レギュレーション: \${targetRegulation}\`);
    console.log('============================================================');

    const cards = await fetchSingleRegulation(targetRegulation);
    await saveToFile(targetRegulation, cards);

    console.log('============================================================');
    console.log(\`✅ \${targetRegulation}レギュレーション取得完了\`);
    console.log(\`   取得カード数: \${cards.length}枚\`);
    console.log('============================================================');

  } catch (error) {
    console.error('❌ データ取得中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main();