import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CountResult {
  count: number;
}

async function migrateCards() {
  const prisma = new PrismaClient();

  try {
    console.log('Starting card migration from local to Neon database...');

    // まずローカルDBのカード数を確認
    const localCardCount = await prisma.$queryRaw<CountResult[]>`SELECT COUNT(*) as count FROM cards`;
    console.log(`Local database has ${localCardCount[0].count} cards`);

    // SQLファイルの内容を読み込んで実行
    const sqlPath = join(process.cwd(), 'scripts', 'migrate-cards.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // SQLを実行
    await prisma.$executeRawUnsafe(sql);

    // 移行後のカード数を確認
    const neonCardCount = await prisma.$queryRaw<CountResult[]>`SELECT COUNT(*) as count FROM cards`;
    console.log(`Migration completed. Neon database now has ${neonCardCount[0].count} cards`);

    console.log('Card migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCards();