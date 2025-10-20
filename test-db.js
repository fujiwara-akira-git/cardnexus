const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  })
  
  try {
    await prisma.$connect()
    console.log('✅ データベース接続成功')
    
    // flavorTextがあるカードを検索
    const cardsWithFlavorText = await prisma.card.findMany({
      where: {
        flavorText: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        flavorText: true
      },
      take: 5
    })
    
    console.log('📋 flavorTextがあるカード:')
    cardsWithFlavorText.forEach(card => {
      console.log(`- ${card.name} (${card.id}): ${card.flavorText}`)
    })
    
  } catch (error) {
    console.error('❌ データベース接続エラー:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()