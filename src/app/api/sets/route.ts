import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const series = searchParams.get('series');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      series?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        id?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};
    if (series) {
      where.series = series;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get sets with pagination
    const [sets, total] = await Promise.all([
      prisma.set.findMany({
        where,
        orderBy: { releaseDate: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { cards: true }
          }
        }
      }),
      prisma.set.count({ where })
    ]);

    return NextResponse.json({
      data: sets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sets' },
      { status: 500 }
    );
  }
}