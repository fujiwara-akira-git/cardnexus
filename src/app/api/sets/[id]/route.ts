import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const set = await prisma.set.findUnique({
      where: { id },
      include: {
        cards: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            rarity: true,
            cardNumber: true,
            cardType: true
          },
          orderBy: { cardNumber: 'asc' }
        },
        _count: {
          select: { cards: true }
        }
      }
    });

    if (!set) {
      return NextResponse.json(
        { error: 'Set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: set });
  } catch (error) {
    console.error('Error fetching set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch set' },
      { status: 500 }
    );
  }
}