import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
  try {
    const setsCount = await prisma.set.count();
    const cardsCount = await prisma.card.count();
    const usersCount = await prisma.user.count();
    const decksCount = await prisma.deck.count();

    console.log('=== Database Counts ===');
    console.log(`Sets: ${setsCount}`);
    console.log(`Cards: ${cardsCount}`);
    console.log(`Users: ${usersCount}`);
    console.log(`Decks: ${decksCount}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();