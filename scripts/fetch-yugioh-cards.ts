/**
 * 遊戯王カードデータ取得スクリプト
 * YGOPRODeck API を使用して全カードデータを取得
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// YGOPRODeck API のベースURL（環境変数から取得）
const API_BASE_URL = process.env.YUGIOH_API_URL;
const TIMEOUT = 120000; // タイムアウト: 120秒（大きいレスポンスのため）
const MAX_RETRIES = 5;

interface YuGiOhCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  card_sets?: Array<{
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_rarity_code: string;
    set_price: string;
  }>;
  card_images: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
    image_url_cropped?: string;
  }>;
  card_prices: Array<{
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  }>;
  banlist_info?: {
    ban_tcg?: string;
    ban_ocg?: string;
    ban_goat?: string;
  };
}

interface YGOAPIResponse {
  data: YuGiOhCard[];
}

/**
 * カードタイプの日本語マッピング
 */
const typeMapping: Record<string, string> = {
  'Normal Monster': '通常モンスター',
  'Effect Monster': '効果モンスター',
  'Fusion Monster': '融合モンスター',
  'Ritual Monster': '儀式モンスター',
  'Synchro Monster': 'シンクロモンスター',
  'XYZ Monster': 'エクシーズモンスター',
  'Pendulum Effect Monster': 'ペンデュラム効果モンスター',
  'Link Monster': 'リンクモンスター',
  'Spell Card': '魔法カード',
  'Trap Card': '罠カード',
};

const attributeMapping: Record<string, string> = {
  'DARK': '闇',
  'LIGHT': '光',
  'WATER': '水',
  'FIRE': '炎',
  'EARTH': '地',
  'WIND': '風',
  'DIVINE': '神',
};

/**
 * 全カードデータを取得
 */
async function fetchAllYuGiOhCards(): Promise<YuGiOhCard[]> {
  console.log('\n遊戯王カードデータを取得中...');
  console.log('  言語: 日本語（language=ja）');

  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`\n  リクエスト送信中... (試行 ${retryCount + 1}/${MAX_RETRIES})`);
      console.log('  ⏳ レスポンスサイズが大きいため、1-2分かかります...');

      const response = await axios.get<YGOAPIResponse>(
        `${API_BASE_URL}/cardinfo.php`,
        {
          params: {
            language: 'ja', // 日本語カード名を取得
          },
          timeout: TIMEOUT,
        }
      );

      const cards = response.data.data;
      console.log(`\n  ✅ 成功: ${cards.length}枚のカードを取得しました`);

      return cards;

    } catch (error) {
      retryCount++;

      if (axios.isAxiosError(error)) {
        const errorMessage = error.code === 'ECONNABORTED' 
          ? 'タイムアウト' 
          : `${error.response?.status || error.code}`;
        
        console.error(`\n  ❌ エラー (試行 ${retryCount}/${MAX_RETRIES}): ${errorMessage}`);
        
        if (error.response?.status === 429) {
          console.log('  レート制限に達しました。30秒待機します...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else if (retryCount < MAX_RETRIES) {
          const waitTime = retryCount * 5000;
          console.log(`  ${waitTime / 1000}秒後にリトライします...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } else {
        console.error(`  予期しないエラー:`, error);
      }

      if (retryCount >= MAX_RETRIES) {
        throw new Error(`全カードの取得に失敗しました（${MAX_RETRIES}回リトライ）`);
      }
    }
  }

  return [];
}

/**
 * カードタイプ別に取得（代替方法）
 */
async function fetchCardsByType(type: string): Promise<YuGiOhCard[]> {
  console.log(`\n  ${type} を取得中...`);

  try {
    const response = await axios.get<YGOAPIResponse>(
      `${API_BASE_URL}/cardinfo.php`,
      {
        params: {
          type: type,
          language: 'ja',
        },
        timeout: TIMEOUT,
      }
    );

    const cards = response.data.data;
    console.log(`    ✅ ${cards.length}枚取得`);
    
    // APIレート制限対策
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return cards;

  } catch (error) {
    console.error(`    ❌ ${type}の取得に失敗:`, error);
    return [];
  }
}

/**
 * カードデータを正規化
 */
function normalizeCard(card: YuGiOhCard) {
  // カードタイプの判定
  let cardCategory = 'モンスター';
  if (card.type.includes('Spell')) cardCategory = '魔法';
  if (card.type.includes('Trap')) cardCategory = '罠';

  // 効果テキストの整形
  let effectText = card.desc;
  
  // ペンデュラムカードの場合、スケールを追加
  if (card.scale !== undefined) {
    effectText = `【ペンデュラムスケール: ${card.scale}】\n${effectText}`;
  }

  // セット情報（最新のもののみ）
  const latestSet = card.card_sets && card.card_sets.length > 0 
    ? card.card_sets[0].set_name 
    : null;
  
  const rarity = card.card_sets && card.card_sets.length > 0
    ? card.card_sets[0].set_rarity
    : null;

  // 制限情報
  let banStatus = null;
  if (card.banlist_info) {
    if (card.banlist_info.ban_ocg) {
      banStatus = card.banlist_info.ban_ocg;
    }
  }

  return {
    apiId: card.id.toString(),
    name: card.name,
    gameTitle: '遊戯王',
    imageUrl: card.card_images[0].image_url,
    rarity: rarity,
    effectText: effectText,
    cardNumber: card.id.toString(),
    expansion: latestSet,
    
    // 遊戯王固有フィールド
    cardType: typeMapping[card.type] || card.type,
    cardCategory: cardCategory, // モンスター/魔法/罠
    attribute: card.attribute ? (attributeMapping[card.attribute] || card.attribute) : null,
    race: card.race, // 種族
    level: card.level || null,
    rank: card.level || null, // エクシーズの場合
    link: card.linkval || null,
    linkMarkers: card.linkmarkers ? card.linkmarkers.join(',') : null,
    pendulumScale: card.scale || null,
    atk: card.atk ?? null,
    def: card.def ?? null,
    archetype: card.archetype || null,
    banStatus: banStatus,
  };
}

/**
 * データを保存
 */
function saveCards(cards: YuGiOhCard[], filename: string): void {
  const normalized = cards.map(card => normalizeCard(card));

  const outputDir = path.join(__dirname, '..', 'data', 'yugioh-cards');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');
  
  console.log(`\n✅ データを保存: ${outputPath}`);
  console.log(`   保存枚数: ${normalized.length}枚`);
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('遊戯王カードデータ取得スクリプト');
  console.log('データソース: YGOPRODeck API');
  console.log('='.repeat(60));

  try {
    // オプション1: 全カード一括取得（推奨）
    console.log('\n【方法1】全カード一括取得を試行...');
    
    const allCards = await fetchAllYuGiOhCards();
    
    if (allCards.length > 0) {
      saveCards(allCards, 'all-cards.json');
      
      // カテゴリ別に分類して保存（オプション）
      const monsters = allCards.filter(c => 
        !c.type.includes('Spell') && !c.type.includes('Trap')
      );
      const spells = allCards.filter(c => c.type.includes('Spell'));
      const traps = allCards.filter(c => c.type.includes('Trap'));

      console.log('\n📊 カテゴリ別統計:');
      console.log(`  モンスターカード: ${monsters.length}枚`);
      console.log(`  魔法カード: ${spells.length}枚`);
      console.log(`  罠カード: ${traps.length}枚`);
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ データ取得完了');
      console.log(`   合計: ${allCards.length}枚`);
      console.log('='.repeat(60));
      
      console.log('\n次のコマンドでデータベースにインポートしてください:');
      console.log('  npx tsx scripts/import-yugioh-cards.ts');
      
    } else {
      throw new Error('カードデータが取得できませんでした');
    }

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    
    console.log('\n【方法2】タイプ別取得を試行します...');
    
    // オプション2: タイプ別に取得
    const types = [
      'Normal Monster',
      'Effect Monster',
      'Fusion Monster',
      'Ritual Monster',
      'Synchro Monster',
      'XYZ Monster',
      'Link Monster',
      'Spell Card',
      'Trap Card',
    ];

    const allCardsByType: YuGiOhCard[] = [];
    
    for (const type of types) {
      const cards = await fetchCardsByType(type);
      allCardsByType.push(...cards);
    }

    if (allCardsByType.length > 0) {
      saveCards(allCardsByType, 'all-cards.json');
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ データ取得完了（タイプ別取得）');
      console.log(`   合計: ${allCardsByType.length}枚`);
      console.log('='.repeat(60));
    } else {
      console.error('\n❌ すべての取得方法が失敗しました');
      process.exit(1);
    }
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });
}

export { fetchAllYuGiOhCards, fetchCardsByType, normalizeCard, saveCards };
