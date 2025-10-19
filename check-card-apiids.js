import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const prisma = new PrismaClient();

async function checkCardApiIds() {
  try {
    const cards = await prisma.card.findMany({ take: 10, select: { apiId: true, name: true } });
    console.log('Sample cards:');
    cards.forEach(card => console.log(`- ${card.apiId}: ${card.name}`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCardApiIds();