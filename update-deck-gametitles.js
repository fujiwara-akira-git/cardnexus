import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const prisma = new PrismaClient();

async function updateDeckGameTitles() {
  try {
    const result = await prisma.deck.updateMany({
      where: {
        gameTitle: 'Pokemon TCG'
      },
      data: {
        gameTitle: 'ポケモンカード'
      }
    });

    console.log(`Updated ${result.count} decks`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDeckGameTitles();