const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJapaneseData() {
  try {
    // 日本語データが入っているカードをいくつか取得
    const cards = await prisma.card.findMany({
      where: {
        gameTitle: 'ポケモンカード',
        nameJa: { not: null },
      },
      take: 5,
      select: {
        name: true,
        nameJa: true,
        expansion: true,
        expansionJa: true,
        cardType: true,
        cardTypeJa: true,
        types: true,
        typesJa: true,
      },
    });

    console.log('='.repeat(60));
    console.log('日本語データサンプル:');
    console.log('='.repeat(60));
    cards.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.name}`);
      console.log(`   日本語名: ${card.nameJa}`);
      console.log(`   拡張: ${card.expansion} → ${card.expansionJa}`);
      console.log(`   種類: ${card.cardType} → ${card.cardTypeJa}`);
      if (card.types) {
        console.log(`   タイプ: ${card.types} → ${card.typesJa}`);
      }
    });
    console.log('\n' + '='.repeat(60));

    // 統計情報
    const total = await prisma.card.count({
      where: { gameTitle: 'ポケモンカード' },
    });

    const withJaName = await prisma.card.count({
      where: {
        gameTitle: 'ポケモンカード',
        nameJa: { not: null },
      },
    });

    console.log(`\n総カード数: ${total}枚`);
    console.log(`日本語名あり: ${withJaName}枚 (${((withJaName / total) * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJapaneseData();
