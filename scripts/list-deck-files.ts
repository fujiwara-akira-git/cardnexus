import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env.localファイルを読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * GitHubからデッキファイル一覧を取得
 */
async function fetchDeckFileList(): Promise<string[]> {
  const url = 'https://api.github.com/repos/PokemonTCG/pokemon-tcg-data/contents/decks/en';
  console.log('📂 GitHubからデッキファイル一覧を取得中...');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const files = await response.json();

    // .jsonファイルのみをフィルタリング
    const jsonFiles = files
      .filter((file: any) => file.name.endsWith('.json'))
      .map((file: any) => file.name);

    console.log(`📋 ${jsonFiles.length}個のデッキファイルが見つかりました`);
    return jsonFiles;
  } catch (error) {
    console.error('❌ ファイル一覧取得エラー:', error);
    return [];
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    const files = await fetchDeckFileList();
    console.log('利用可能なデッキファイル:');
    files.slice(0, 10).forEach(file => console.log(`  - ${file}`));
    if (files.length > 10) {
      console.log(`  ... 他 ${files.length - 10} ファイル`);
    }

  } catch (error) {
    console.error('メイン処理エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
main();