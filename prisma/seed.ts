import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Card Database...')

  // --- サンプルカード挿入処理は不要なのでコメントアウト ---
  // const cards = [ ... ]
  // for (const cardData of cards) { ... }

  // --- 3つのJSONファイルからカードデータを一括で取り込む ---
  const jsonFiles = [
    path.join(__dirname, '../data/pokemon-cards/regulation-G-github.json'),
    path.join(__dirname, '../data/pokemon-cards/regulation-H-github.json'),
    path.join(__dirname, '../data/pokemon-cards/regulation-I-github.json')
  ]

  for (const jsonPath of jsonFiles) {
    if (fs.existsSync(jsonPath)) {
      const jsonRaw = fs.readFileSync(jsonPath, 'utf-8')
      const jsonCards = JSON.parse(jsonRaw)
      for (const card of jsonCards) {
        // Cardスキーマに合わせてフィールドをマッピング
        // 既存フィールドにマッピング
        const cardData = {
          apiId: card.id || card.apiId,
          name: card.name,
          nameJa: card.nameJa || null,
          gameTitle: card.gameTitle || 'ポケモンカード',
          imageUrl: card.images?.large || card.imageUrl,
          rarity: card.rarity,
          effectText: card.effectText || null,
          effectTextJa: card.effectTextJa || null,
          cardNumber: card.number || card.cardNumber,
          expansion: card.set?.name || card.expansion,
          expansionJa: card.expansionJa || null,
          regulationMark: card.regulationMark || card.regulation || null,
          cardType: card.supertype || card.cardType || null,
          cardTypeJa: card.cardTypeJa || null,
          hp: card.hp ? parseInt(card.hp) : null,
          types: Array.isArray(card.types) ? card.types.join(',') : card.types || null,
          typesJa: Array.isArray(card.typesJa) ? card.typesJa.join(',') : card.typesJa || null,
          evolveFrom: card.evolvesFrom || card.evolveFrom || null,
          evolveFromJa: card.evolveFromJa || null,
          artist: card.artist || null,
          subtypes: Array.isArray(card.subtypes) ? card.subtypes.join(',') : card.subtypes || null,
          subtypesJa: Array.isArray(card.subtypesJa) ? card.subtypesJa.join(',') : card.subtypesJa || null,
          releaseDate: card.releaseDate || card.set?.releaseDate || null,
          abilities: card.abilities?.length ? card.abilities : null,
          attacks: card.attacks?.length ? card.attacks : null,
          weaknesses: card.weaknesses?.length ? card.weaknesses : null,
          resistances: card.resistances?.length ? card.resistances : null,
          retreatCost: card.retreatCost?.length ? card.retreatCost : null,
          legalities: card.legalities || card.legalFormats || null,
          rules: card.rules || null,
          source: card.source || null,
          nationalPokedexNumbers: card.nationalPokedexNumbers || null,
          extraJson: card // 未マッピング項目を丸ごと保存（schemaにJson型extraJson追加必要）
        }
        try {
          await prisma.card.create({ data: cardData })
          console.log(`✅ Imported card from JSON: ${card.name}`)
        } catch (e) {
          console.error(`❌ Failed to import card: ${card.name}`, e)
        }
      }
    }
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })