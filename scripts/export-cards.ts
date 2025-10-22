import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function exportCards() {
  // ローカルDBに接続
  const localPrisma = new PrismaClient({
    datasourceUrl: "postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"
  });

  try {
    console.log('Exporting cards from local database...');

    const cards = await localPrisma.card.findMany();
    console.log(`Found ${cards.length} cards to export`);

    // JSONファイルに保存
    const exportPath = join(process.cwd(), 'card-export.json');
    writeFileSync(exportPath, JSON.stringify(cards, null, 2));

    console.log(`Cards exported to ${exportPath}`);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
  }
}

exportCards();