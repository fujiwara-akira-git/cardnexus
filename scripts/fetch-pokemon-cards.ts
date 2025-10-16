/**
 * ポケモンカードデータ取得スクリプト
 * Pokemon TCG API を使用してG、H、Iレギュレーションのカードデータを取得
 */

import 'dotenv/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Pokemon TCG API のベースURL（環境変数から取得）
const API_BASE_URL = process.env.POKEMON_TCG_API_URL;
const API_KEY = process.env.POKEMON_TCG_API_KEY; // APIキーは環境変数から取得
const MAX_RETRIES = 10; // 最大リトライ回数を10回に調整（速度重視）
const TIMEOUT = 120000; // タイムアウト: 120秒に延長（2分）
const PAGE_SIZE = 100; // 1ページあたりの取得枚数を100枚に削減（安定性向上）
const REQUEST_DELAY = 5000; // リクエスト間隔を5秒に設定（API負荷軽減）

interface PokemonCard {
  id: string;
  name: string;
  supertype: string; // Pokémon, Trainer, Energy
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
  regulationMark?: string; // G, H, I などのレギュレーションマーク
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: Record<string, {
      low?: number;
      mid?: number;
      high?: number;
      market?: number;
    }>;
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
 * 指定されたレギュレーションマークのカードを取得
 */
async function fetchCardsByRegulation(regulation: string): Promise<PokemonCard[]> {
  const cards: PokemonCard[] = [];
  let page = 1;
  let hasMorePages = true;

  console.log(`\n${regulation}レギュレーションのカードを取得中...`);

  while (hasMorePages) {
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
              pageSize: PAGE_SIZE, // 定数を使用（50枚）
            },
            headers: API_KEY ? { 'X-Api-Key': API_KEY } : {},
            timeout: TIMEOUT, // タイムアウト設定（120秒）
          }
        );

        const { data, page: currentPage, totalCount } = response.data;
        cards.push(...data);

        console.log(`  ページ ${currentPage}: ${data.length}枚取得 (合計: ${cards.length}/${totalCount}枚)`);

        hasMorePages = cards.length < totalCount;
        page++;
        success = true;

        // レート制限対策: ページ間で待機
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      } catch (error) {
        retryCount++;
        
        if (axios.isAxiosError(error)) {
          const errorMessage = error.code === 'ECONNABORTED' 
            ? 'タイムアウト' 
            : `${error.response?.status || error.code}`;
          
          console.error(`  エラー (試行 ${retryCount}/${MAX_RETRIES}): ${errorMessage} - ${error.message}`);
          
          if (error.response?.status === 429) {
            console.log('  レート制限に達しました。10秒待機します...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          } else if (retryCount < MAX_RETRIES) {
            const waitTime = retryCount * 5000; // リトライごとに待機時間を5秒ずつ増やす
            console.log(`  ${waitTime / 1000}秒後にリトライします...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } else {
          console.error(`  予期しないエラー:`, error);
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error(`${regulation}レギュレーションのページ${page}の取得に失敗しました（${MAX_RETRIES}回リトライ）`);
        }
      }
    }
  }

  return cards;
}

/**
 * カードデータを正規化してファイルに保存
 */
function normalizeAndSaveCards(cards: PokemonCard[], regulation: string): void {
  const normalized = cards.map(card => ({
    apiId: card.id,
    name: card.name,
    gameTitle: 'ポケモンカード',
    imageUrl: card.images.large,
    rarity: card.rarity || null,
    effectText: generateEffectText(card),
    cardNumber: card.number,
    expansion: card.set.name,
    regulation,
    cardType: card.supertype,
    hp: card.hp ? parseInt(card.hp) : null,
    types: card.types ? card.types.join(', ') : null,
    evolveFrom: card.evolvesFrom || null,
    releaseDate: card.set.releaseDate,
    artist: card.artist || null,
    subtypes: card.subtypes ? card.subtypes.join(', ') : null,
  }));

  const outputDir = path.join(__dirname, '..', 'data', 'pokemon-cards');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `regulation-${regulation}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');
  
  console.log(`\n${regulation}レギュレーションのデータを保存: ${outputPath}`);
  console.log(`  保存枚数: ${normalized.length}枚`);
}

/**
 * カードの効果テキストを生成
 */
function generateEffectText(card: PokemonCard): string | null {
  const parts: string[] = [];

  // 特性
  if (card.abilities && card.abilities.length > 0) {
    card.abilities.forEach(ability => {
      parts.push(`【${ability.type}】${ability.name}\n${ability.text}`);
    });
  }

  // ワザ
  if (card.attacks && card.attacks.length > 0) {
    card.attacks.forEach(attack => {
      const cost = attack.cost.join('');
      const damage = attack.damage || '';
      parts.push(`【ワザ】${cost} ${attack.name} ${damage}\n${attack.text || ''}`);
    });
  }

  // 弱点・抵抗力・にげる
  const footer: string[] = [];
  if (card.weaknesses && card.weaknesses.length > 0) {
    const weak = card.weaknesses.map(w => `${w.type}${w.value}`).join(', ');
    footer.push(`弱点: ${weak}`);
  }
  if (card.resistances && card.resistances.length > 0) {
    const resist = card.resistances.map(r => `${r.type}${r.value}`).join(', ');
    footer.push(`抵抗力: ${resist}`);
  }
  if (card.retreatCost && card.retreatCost.length > 0) {
    footer.push(`にげる: ${card.retreatCost.length}個`);
  }

  if (footer.length > 0) {
    parts.push(footer.join(' / '));
  }

  // フレーバーテキスト
  if (card.flavorText) {
    parts.push(`\n${card.flavorText}`);
  }

  return parts.length > 0 ? parts.join('\n\n') : null;
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('ポケモンカードデータ取得スクリプト');
  console.log('対象レギュレーション: G, H, I');
  console.log('='.repeat(60));

  const regulations = ['G', 'H', 'I'];
  const allCards: Record<string, PokemonCard[]> = {};

  for (const regulation of regulations) {
    try {
      const cards = await fetchCardsByRegulation(regulation);
      allCards[regulation] = cards;
      normalizeAndSaveCards(cards, regulation);
    } catch (error) {
      console.error(`\n${regulation}レギュレーションのデータ取得に失敗:`, error);
      process.exit(1);
    }
  }

  // サマリー表示
  console.log('\n' + '='.repeat(60));
  console.log('データ取得完了');
  console.log('='.repeat(60));
  regulations.forEach(reg => {
    console.log(`  ${reg}レギュレーション: ${allCards[reg]?.length || 0}枚`);
  });
  console.log(`  合計: ${Object.values(allCards).reduce((sum, cards) => sum + cards.length, 0)}枚`);
  console.log('='.repeat(60));
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });
}

export { fetchCardsByRegulation, normalizeAndSaveCards };
