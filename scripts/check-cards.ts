import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCards() {
  try {
    // Cardテーブルの総数を取得
    const cardCount = await prisma.card.count();
    console.log(`📊 Card総数: ${cardCount}`);

    // Cardのサンプルを表示
    const sampleCards = await prisma.card.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        cardNumber: true,
        expansion: true,
        gameTitle: true,
      },
    });

    console.log('\n🃏 Cardサンプル:');
    sampleCards.forEach((card) => {
      console.log(`- ${card.name} (${card.cardNumber} - ${card.expansion}) - ${card.gameTitle}`);
    });

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCards();