import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImportResults() {
  try {
    // デッキの総数を取得
    const deckCount = await prisma.deck.count();
    console.log(`📊 デッキ総数: ${deckCount}`);

    // UnregisteredCardの総数を取得
    const unregisteredCount = await prisma.unregisteredCard.count();
    console.log(`📊 UnregisteredCard総数: ${unregisteredCount}`);

    // 最新のデッキをいくつか表示
    const recentDecks = await prisma.deck.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        gameTitle: true,
        createdAt: true,
        _count: {
          select: {
            deckCards: true,
            deckUnregisteredCards: true,
          },
        },
      },
    });

    console.log('\n📋 最新のデッキ:');
    recentDecks.forEach((deck) => {
      console.log(`- ${deck.name} (${deck.gameTitle}): ${deck._count.deckCards}枚の登録カード, ${deck._count.deckUnregisteredCards}枚の未登録カード`);
    });

    // UnregisteredCardのサンプルを表示
    const sampleUnregistered = await prisma.unregisteredCard.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        cardNumber: true,
        expansion: true,
      },
    });

    console.log('\n🃏 UnregisteredCardサンプル:');
    sampleUnregistered.forEach((card) => {
      console.log(`- ${card.name} (${card.cardNumber} - ${card.expansion})`);
    });

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImportResults();