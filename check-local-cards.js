import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const prisma = new PrismaClient();

async function checkCardCount() {
  try {
    const count = await prisma.card.count();
    console.log(`Local DB Card count: ${count}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCardCount();