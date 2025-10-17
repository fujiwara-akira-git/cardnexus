/**
 * 取得済みGレギュレーションカード（25枚）をインポート用に変換
 */

import * as fs from 'fs';
import * as path from 'path';

async function convertExistingData() {
  const sourceFile = path.join(process.cwd(), 'data', 'pokemon-cards', 'regulation-G-full.json');
  const targetFile = path.join(process.cwd(), 'data', 'pokemon-cards', 'regulation-G-api.json');
  
  if (!fs.existsSync(sourceFile)) {
    console.log('❌ regulation-G-full.json が見つかりません');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    console.log(`📊 ${data.length}枚のGレギュレーションカードを変換中...`);
    
    // インポート用形式に変換
    const convertedData = data.map((card: any) => ({
      apiId: card.apiId,
      name: card.name,
      gameTitle: card.gameTitle,
      cardType: card.cardType,
      rarity: card.rarity,
      regulation: card.regulation,
      effectText: card.effectText,
      cardNumber: card.cardNumber,
      expansion: card.expansion,
      hp: card.hp,
      types: Array.isArray(card.types) ? card.types : [],
      artist: card.artist,
      imageUrl: card.imageUrl,
      legalFormats: card.legalFormats,
      abilities: card.abilities || [],
      attacks: card.attacks || [],
      weakness: card.weakness,
      resistance: card.resistance,
      retreatCost: card.retreatCost,
      flavorText: card.flavorText,
    }));
    
    fs.writeFileSync(targetFile, JSON.stringify(convertedData, null, 2), 'utf8');
    
    console.log(`✅ ${convertedData.length}枚を ${targetFile} に変換完了`);
    console.log('📝 インポート準備完了 - npm run import:cards を実行してください');
    
  } catch (error) {
    console.error('❌ 変換エラー:', error);
  }
}

convertExistingData();