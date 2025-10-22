import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"
    }
  }
});

const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_2EBhCms9gLiA@ep-winter-fog-ad5cgr4o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function migrateCardsToNeon() {
  try {
    console.log('🔄 CardデータをNeonデータベースに移行開始...');

    // ローカルDBからCardデータを取得
    const cards = await localPrisma.card.findMany();
    console.log(`📊 移行対象Card数: ${cards.length}`);

    let successCount = 0;
    let errorCount = 0;

    // 各Cardを個別に処理
    for (const card of cards) {
      try {
        // データを適切な形式に変換
        const cardData = {
          id: card.id,
          name: card.name,
          gameTitle: card.gameTitle,
          imageUrl: card.imageUrl,
          rarity: card.rarity,
          effectText: card.effectText,
          cardNumber: card.cardNumber,
          expansion: card.expansion,
          supertype: card.supertype,
          subtypes: card.subtypes,
          hp: card.hp,
          types: card.types,
          evolveFrom: card.evolveFrom,
          rules: card.rules,
          attacks: card.attacks,
          weaknesses: card.weaknesses,
          resistances: card.resistances,
          retreatCost: card.retreatCost,
          artist: card.artist,
          flavorText: card.flavorText,
          nationalPokedexNumbers: card.nationalPokedexNumbers,
          legalities: card.legalities,
          source: card.source,
          apiId: card.apiId,
          cardType: card.cardType,
          cardTypeJa: card.cardTypeJa,
          effectTextJa: card.effectTextJa,
          evolveFromJa: card.evolveFromJa,
          expansionJa: card.expansionJa,
          nameJa: card.nameJa,
          regulationMark: card.regulationMark,
          releaseDate: card.releaseDate,
          subtypesJa: card.subtypesJa,
          typesJa: card.typesJa,
          abilities: card.abilities,
          setId: card.setId,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        };

        await neonPrisma.card.upsert({
          where: { id: card.id },
          update: cardData,
          create: cardData,
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Card ${card.id} (${card.name}) の移行エラー:`, error);
        errorCount++;
      }
    }

    console.log(`✅ ${successCount}件のCardデータを移行完了`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount}件のエラー`);
    }

    // 移行後の確認
    const neonCardCount = await neonPrisma.card.count();
    console.log(`📊 NeonDBのCard総数: ${neonCardCount}`);

  } catch (error) {
    console.error('❌ 移行エラー:', error);
  } finally {
    await localPrisma.$disconnect();
    await neonPrisma.$disconnect();
  }
}

migrateCardsToNeon();