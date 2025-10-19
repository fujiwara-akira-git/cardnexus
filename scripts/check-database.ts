import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

/**
 * データベースの統計情報を表示
 */
async function showDatabaseStats(): Promise<void> {
  console.log('📊 データベース統計情報');
  console.log('============================================================');

  // 総カード数
  const totalCards = await prisma.card.count();
  console.log(`📋 総カード数: ${totalCards}枚`);

  // セットごとのカード数
  const cardsBySet = await prisma.card.groupBy({
    by: ['expansion'],
    _count: {
      apiId: true,
    },
    orderBy: {
      _count: {
        apiId: 'desc',
      },
    },
  });

  console.log('\n📦 セットごとのカード数:');
  cardsBySet.forEach((set) => {
    console.log(`  ${set.expansion}: ${set._count.apiId}枚`);
  });

  // Base Setのカードを確認
  const baseSetCards = await prisma.card.findMany({
    where: {
      expansion: 'Base Set',
    },
    select: {
      apiId: true,
      name: true,
      cardNumber: true,
    },
    orderBy: {
      cardNumber: 'asc',
    },
  });

  console.log('\n🎴 Base Setのカード:');
  baseSetCards.forEach((card) => {
    console.log(`  ${card.cardNumber}: ${card.name} (${card.apiId})`);
  });

  // base1-で始まるAPI IDを持つカードを確認
  const base1Cards = await prisma.card.findMany({
    where: {
      apiId: {
        startsWith: 'base1-',
      },
    },
    select: {
      apiId: true,
      name: true,
      cardNumber: true,
    },
    orderBy: {
      apiId: 'asc',
    },
  });

  console.log('\n🔍 base1-で始まるAPI IDのカード:');
  base1Cards.forEach((card) => {
    console.log(`  ${card.apiId}: ${card.name} (${card.cardNumber})`);
  });

  // Energyカードを確認
  const energyCards = await prisma.card.findMany({
    where: {
      name: {
        contains: 'Energy',
      },
      expansion: 'Base Set',
    },
    select: {
      apiId: true,
      name: true,
      cardNumber: true,
    },
  });

  console.log('\n⚡ Base SetのEnergyカード:');
  energyCards.forEach((card) => {
    console.log(`  ${card.apiId}: ${card.name} (${card.cardNumber})`);
  });
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  try {
    await showDatabaseStats();
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();