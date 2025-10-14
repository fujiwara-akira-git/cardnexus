const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ データベース接続成功')
    
    // 既存のテーブル確認
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📋 既存のテーブル:', result)
    
  } catch (error) {
    console.error('❌ データベース接続エラー:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()