import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

async function importCards() {
  const prisma = new PrismaClient();

  try {
    console.log('Importing cards to Neon database...');

    // エクスポートしたJSONファイルを読み込み
    const exportPath = join(process.cwd(), 'card-export.json');
    const cardsData = JSON.parse(readFileSync(exportPath, 'utf8'));

    console.log(`Found ${cardsData.length} cards to import`);

    // バッチ処理でインポート（メモリ使用量を抑えるため）
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < cardsData.length; i += batchSize) {
      const batch = cardsData.slice(i, i + batchSize);

      await prisma.card.createMany({
        data: batch,
        skipDuplicates: true
      });

      imported += batch.length;
      console.log(`Imported ${imported}/${cardsData.length} cards...`);
    }

    // 最終確認
    const totalCards = await prisma.card.count();
    console.log(`Import completed! Total cards in Neon database: ${totalCards}`);

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importCards();