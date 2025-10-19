import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Users:', users.map(u => ({ id: u.id, username: u.username })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();