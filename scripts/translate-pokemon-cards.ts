/**
 * ポケモンカード日本語翻訳スクリプト
 * 既存のJSONデータをベースに、英語から日本語への翻訳を実施
 * Grok や他のLLMを使用して翻訳（キャッシュ付き）
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

interface TranslationCache {
  [key: string]: string;
}

interface LocalizedCard {
  apiId: string;
  name: string;
  nameJa: string;
  gameTitle: string;
  imageUrl: string;
  rarity: string | null;
  effectText: string | null;
  effectTextJa: string | null;
  cardNumber: string;
  expansion: string;
  expansionJa: string;
  regulation: string;
  cardType: string;
  cardTypeJa: string;
  hp: number | null;
  types: string | null;
  typesJa: string | null;
  evolveFrom: string | null;
  evolveFromJa: string | null;
  releaseDate: string;
  artist: string | null;
  subtypes: string | null;
  subtypesJa: string | null;
}

/**
 * Pokemon TCG の拡張セット名の日本語変換テーブル
 */
const EXPANSION_NAME_MAP: Record<string, string> = {
  // Regulation G
  "Scarlet & Violet": "スカーレット&バイオレット",
  "Scarlet & Violet: Promo": "スカーレット&バイオレット プロモ",
  "Temporal Forces": "タイムゲイザー",
  "Paldean Fates": "古い仲間たち",
  "Pecharunt ex": "ペチャント",
  "Twilight Masquerade": "スターターセットex タルップ",
  "Shrouded Fable": "スターターセットex クワッス",
  // Regulation H
  "Crown Zenith": "ハイクラスパック シャイニースター",
  "Paradox Rift": "パラドックスリフト",
  "Obsidian Flames": "闘技場セット 40 黒き炎",
  "151": "151",
  "Surging Sparks": "ハイクラスパック シャイニースター",
  // 他の拡張セット
};

/**
 * ポケモンの種類の日本語変換
 */
const CARD_TYPE_MAP: Record<string, string> = {
  'Pokémon': 'ポケモン',
  'Trainer': 'トレーナー',
  'Energy': 'エネルギー',
};

/**
 * ポケモンのタイプの日本語変換
 */
const POKEMON_TYPE_MAP: Record<string, string> = {
  'Fire': '炎',
  'Grass': '草',
  'Water': '水',
  'Lightning': '雷',
  'Wind': '風',
  'Psychic': '超',
  'Fighting': '闘',
  'Metal': '鋼',
  'Darkness': '悪',
  'Fairy': 'フェアリー',
  'Dragon': 'ドラゴン',
  'Colorless': '無',
};

/**
 * カードのサブタイプの日本語変換
 */
const SUBTYPE_MAP: Record<string, string> = {
  'Basic': '基本',
  'Stage 1': '進化1段階',
  'Stage 2': '進化2段階',
  'VSTAR': 'VSTAR',
  'VMAX': 'VMAX',
  'V': 'V',
  'ex': 'ex',
  'EX': 'EX',
  'Tera': 'テラ',
  'Supporter': 'サポーター',
  'Item': 'グッズ',
  'Stadium': 'スタジアム',
  'Pokémon Tool': 'ポケモンのどうぐ',
  'Pokémon Tool F': 'ポケモンのどうぐF',
};

/**
 * 翻訳キャッシュを読み込む
 */
function loadTranslationCache(): TranslationCache {
  const cacheDir = path.join(__dirname, '..', 'data', 'translation-cache');
  const cachePath = path.join(cacheDir, 'pokemon-translation.json');

  if (!fs.existsSync(cachePath)) {
    return {};
  }

  try {
    const cache = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(cache);
  } catch {
    return {};
  }
}

/**
 * 翻訳キャッシュを保存
 */
function saveTranslationCache(cache: TranslationCache): void {
  const cacheDir = path.join(__dirname, '..', 'data', 'translation-cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const cachePath = path.join(cacheDir, 'pokemon-translation.json');
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * 拡張セット名を翻訳
 */
function translateExpansionName(expansionName: string): string {
  return EXPANSION_NAME_MAP[expansionName] || expansionName;
}

/**
 * ポケモンのタイプを翻訳
 */
function translateTypes(types: string | null): string | null {
  if (!types) return null;
  return types
    .split(', ')
    .map(type => POKEMON_TYPE_MAP[type.trim()] || type.trim())
    .join(', ');
}

/**
 * カードのサブタイプを翻訳
 */
function translateSubtypes(subtypes: string | null): string | null {
  if (!subtypes) return null;
  return subtypes
    .split(', ')
    .map(subtype => SUBTYPE_MAP[subtype.trim()] || subtype.trim())
    .join(', ');
}

/**
 * カードの種類を翻訳
 */
function translateCardType(cardType: string): string {
  return CARD_TYPE_MAP[cardType] || cardType;
}

/**
 * 簡易的なポケモン名の日本語マッピング
 * 全ポケモン名を含めるのは大量なので、主要なものだけ含める
 */
const POKEMON_NAME_MAP: Record<string, string> = {
  // 例: いくつかのポケモン名
  'Pikachu': 'ピカチュウ',
  'Charizard': 'リザードン',
  'Blastoise': 'フリーザー',
  'Venusaur': 'フシギバナ',
  'Arcanine': 'ウインディ',
  'Gyarados': 'ギャラドス',
  'Alakazam': 'フーディン',
  'Machamp': 'キングラー',
  'Golem': 'ゴーレム',
  'Arbok': 'アーボック',
  'Persian': 'ペルシアン',
  'Lapras': 'ラプラス',
  'Snorlax': 'カビゴン',
  'Articuno': 'フリーザー',
  'Zapdos': 'サンダー',
  'Moltres': 'ファイヤー',
  'Dragonite': 'ドラゴナイト',
  'Mewtwo': 'ミュウツー',
  'Mew': 'ミュウ',
};

/**
 * ポケモン名を翻訳（手動マッピングのみ、未登録は英語のまま）
 */
function translatePokemonName(name: string): string {
  return POKEMON_NAME_MAP[name] || name;
}

/**
 * 効果テキストを簡易翻訳
 * 複雑な翻訳はLLMに委ねるため、ここではプレースホルダーを使用
 */
function translateEffectText(text: string | null, cache: TranslationCache): string | null {
  if (!text) return null;

  // キャッシュをチェック
  if (cache[text]) {
    return cache[text];
  }

  // 簡易的な置換（実際の運用ではLLMを使用することを推奨）
  let translated = text
    .replace(/Ability/g, '特性')
    .replace(/Attack/g, 'ワザ')
    .replace(/Weakness/g, '弱点')
    .replace(/Resistance/g, '抵抗力')
    .replace(/Retreat Cost/g, 'にげるためのコスト')
    .replace(/Damage/g, 'ダメージ')
    .replace(/Pokémon/g, 'ポケモン')
    .replace(/Energy/g, 'エネルギー')
    .replace(/Trainer/g, 'トレーナー');

  // キャッシュに追加
  cache[text] = translated;

  return translated;
}

/**
 * カードを日本語化
 */
function localizeCard(
  card: any,
  cache: TranslationCache
): LocalizedCard {
  return {
    apiId: card.apiId,
    name: card.name,
    nameJa: translatePokemonName(card.name),
    gameTitle: card.gameTitle,
    imageUrl: card.imageUrl,
    rarity: card.rarity,
    effectText: card.effectText,
    effectTextJa: translateEffectText(card.effectText, cache),
    cardNumber: card.cardNumber,
    expansion: card.expansion,
    expansionJa: translateExpansionName(card.expansion),
    regulation: card.regulation,
    cardType: card.cardType,
    cardTypeJa: translateCardType(card.cardType),
    hp: card.hp,
    types: card.types,
    typesJa: translateTypes(card.types),
    evolveFrom: card.evolveFrom,
    evolveFromJa: card.evolveFrom ? translatePokemonName(card.evolveFrom) : null,
    releaseDate: card.releaseDate,
    artist: card.artist,
    subtypes: card.subtypes,
    subtypesJa: translateSubtypes(card.subtypes),
  };
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('ポケモンカード日本語翻訳スクリプト');
  console.log('='.repeat(60));

  const regulations = ['G', 'H', 'I'];
  const cache = loadTranslationCache();

  const dataDir = path.join(__dirname, '..', 'data', 'pokemon-cards');
  const outputDir = path.join(__dirname, '..', 'data', 'pokemon-cards-ja');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalCards = 0;

  for (const regulation of regulations) {
    const inputPath = path.join(dataDir, `regulation-${regulation}.json`);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`\n${regulation}レギュレーション: ファイルが見つかりません`);
      continue;
    }

    try {
      console.log(`\n${regulation}レギュレーション: 翻訳中...`);
      
      const rawCards = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
      const localizedCards = rawCards.map((card: any) => 
        localizeCard(card, cache)
      );

      const outputPath = path.join(outputDir, `regulation-${regulation}-ja.json`);
      fs.writeFileSync(outputPath, JSON.stringify(localizedCards, null, 2), 'utf-8');

      console.log(`  翻訳完了: ${localizedCards.length}枚`);
      console.log(`  保存先: ${outputPath}`);
      
      totalCards += localizedCards.length;
    } catch (error) {
      console.error(`  エラー: ${error}`);
    }
  }

  // 翻訳キャッシュを保存
  saveTranslationCache(cache);

  console.log('\n' + '='.repeat(60));
  console.log('翻訳完了');
  console.log(`  合計: ${totalCards}枚`);
  console.log(`  翻訳キャッシュ: ${Object.keys(cache).length}エントリ`);
  console.log('='.repeat(60));
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });
}

export { localizeCard, translatePokemonName, translateExpansionName };
