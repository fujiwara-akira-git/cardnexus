import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * データベースからすべてのカードデータを削除
 */
async function clearAllCards(): Promise<void> {
  console.log('🗑️  Cardテーブルからすべてのデータを削除します...');

  try {
    // 関連するデータを先に削除（外部キー制約がある場合）
    console.log('📋 関連データの削除を開始...');

    // DeckCardテーブルのデータを削除
    const deletedDeckCards = await prisma.deckCard.deleteMany({});
    console.log(`🗑️  ${deletedDeckCards.count}件のデッキカード関連データを削除しました`);

    // Listingテーブルのデータを削除
    const deletedListings = await prisma.listing.deleteMany({});
    console.log(`🗑️  ${deletedListings.count}件の出品データを削除しました`);

    // Priceテーブルのデータを削除
    const deletedPrices = await prisma.price.deleteMany({});
    console.log(`🗑️  ${deletedPrices.count}件の価格データを削除しました`);

    // Cardテーブルのデータを削除
    const deletedCards = await prisma.card.deleteMany({});
    console.log(`🗑️  ${deletedCards.count}件のカードデータを削除しました`);

    console.log('✅ データベースのクリアが完了しました');

  } catch (error) {
    console.error('❌ データ削除エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
clearAllCards()
  .then(() => {
    console.log('🎉 データベースクリア処理が完了しました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 データベースクリア処理が失敗しました:', error);
    process.exit(1);
  });