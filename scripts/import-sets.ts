import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SetData {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  total: number;
  printedTotal?: number;
  legalities: unknown;
  images: unknown;
  ptcgoCode?: string;
}

async function importSets() {
  try {
    // Fetch full sets data from local file (same as GitHub)
    const setsFile = path.join(process.cwd(), 'data', 'pokemon-sets', 'en.json');

    if (!fs.existsSync(setsFile)) {
      console.log('Pokemon sets data not found. Please download from PokemonTCG/pokemon-tcg-data');
      return;
    }

    const setsData: SetData[] = JSON.parse(fs.readFileSync(setsFile, 'utf-8'));

    console.log(`Fetched ${setsData.length} sets from local data.`);

    for (const setData of setsData) {
      await prisma.set.upsert({
        where: { id: setData.id },
        update: {
          name: setData.name,
          series: setData.series,
          releaseDate: setData.releaseDate,
          totalCards: setData.total,
          printedTotal: setData.printedTotal || null,
          legalities: setData.legalities as Prisma.InputJsonValue,
          images: setData.images as Prisma.InputJsonValue,
          ptcgoCode: setData.ptcgoCode || null,
        },
        create: {
          id: setData.id,
          name: setData.name,
          series: setData.series,
          releaseDate: setData.releaseDate,
          totalCards: setData.total,
          printedTotal: setData.printedTotal || null,
          legalities: setData.legalities as Prisma.InputJsonValue,
          images: setData.images as Prisma.InputJsonValue,
          ptcgoCode: setData.ptcgoCode || null,
        },
      });
    }

    console.log('Sets imported successfully');
  } catch (error) {
    console.error('Error importing sets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importSets();