import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

/**
 * コマンドを実行して結果を取得
 */
function runCommand(command: string, description: string): boolean {
  try {
    console.log(`\n🔄 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description}完了`);
    return true;
  } catch (error) {
    console.error(`❌ ${description}失敗:`, error);
    return false;
  }
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('='.repeat(80));
  console.log('Card Nexus データインポートスクリプト');
  console.log('順序: Set → Card → Deck');
  console.log('='.repeat(80));

  try {
    // データベース接続確認
    await prisma.$connect();
    console.log('\n✅ データベースに接続しました');

    // 1. Setデータのインポート
    const setImportSuccess = runCommand(
      'npx tsx scripts/import-sets.ts',
      'セットデータのインポート'
    );

    if (!setImportSuccess) {
      console.error('セットデータのインポートに失敗しました');
      return;
    }

    // 2. Cardデータのインポート
    const cardImportSuccess = runCommand(
      'npx tsx scripts/import-pokemon-cards.ts',
      'カードデータのインポート'
    );

    if (!cardImportSuccess) {
      console.error('カードデータのインポートに失敗しました');
      return;
    }

    // 3. Deckデータのインポート
    const deckImportSuccess = runCommand(
      'npx tsx scripts/import-decks.ts',
      'デッキデータのインポート'
    );

    if (!deckImportSuccess) {
      console.error('デッキデータのインポートに失敗しました');
      return;
    }

    // 統計情報表示
    console.log('\n' + '='.repeat(80));
    console.log('📊 インポート完了 - 統計情報');
    console.log('='.repeat(80));

    const setCount = await prisma.set.count();
    const cardCount = await prisma.card.count();
    const deckCount = await prisma.deck.count();
    const unregisteredCardCount = await prisma.unregisteredCard.count();

    console.log(`📦 セット数: ${setCount}個`);
    console.log(`🃏 カード数: ${cardCount}枚`);
    console.log(`📚 デッキ数: ${deckCount}個`);
    console.log(`❓ 未登録カード数: ${unregisteredCardCount}枚`);

    // ゲームタイトル別の統計
    const pokemonCards = await prisma.card.count({
      where: { gameTitle: 'ポケモンカード' }
    });
    const pokemonDecks = await prisma.deck.count({
      where: { gameTitle: 'ポケモンカード' }
    });

    console.log(`\n🎯 ポケモンカード:`);
    console.log(`  - カード: ${pokemonCards}枚`);
    console.log(`  - デッキ: ${pokemonDecks}個`);

    console.log('\n🎉 すべてのデータインポートが完了しました！');

  } catch (error) {
    console.error('\n💥 エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 データベース接続を切断しました');
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(error => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });
}