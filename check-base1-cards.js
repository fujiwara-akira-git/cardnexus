import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const prisma = new PrismaClient();

async function checkSpecificCardIds() {
  try {
    const cardIds = ['base1-49', 'base1-47', 'base1-52', 'base1-8'];

    for (const cardId of cardIds) {
      const card = await prisma.card.findFirst({
        where: { apiId: cardId },
        select: { id: true, apiId: true, name: true }
      });

      if (card) {
        console.log(`✅ ${cardId}: 見つかりました - ${card.name}`);
      } else {
        console.log(`❌ ${cardId}: 見つかりません`);
      }
    }

    // base1-で始まるカードを検索
    const base1Cards = await prisma.card.findMany({
      where: { apiId: { startsWith: 'base1-' } },
      select: { apiId: true, name: true },
      take: 10
    });

    console.log(`\nBase1形式のカード数: ${base1Cards.length}`);
    if (base1Cards.length > 0) {
      console.log('Base1形式のサンプル:');
      base1Cards.forEach(card => console.log(`  ${card.apiId}: ${card.name}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificCardIds();