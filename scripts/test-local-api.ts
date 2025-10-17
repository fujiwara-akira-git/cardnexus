#!/usr/bin/env tsx

async function testLocalAPI() {
  try {
    console.log('🔍 ローカルAPI検索テスト開始...\n')

    // テスト1: 基本的なカード検索
    console.log('📋 テスト1: 基本的なポケモンカード検索')
    const basicTest = await fetch('http://localhost:3001/api/cards?gameTitle=ポケモンカード&page=1&limit=5')
    const basicResult = await basicTest.json()
    
    console.log(`ステータス: ${basicTest.status}`)
    if (basicResult.success) {
      console.log(`✅ 成功 - 検索結果: ${basicResult.data.cards.length}枚`)
      console.log(`総カード数: ${basicResult.data.pagination.totalCount}枚`)
      console.log(`最初のカード: ${basicResult.data.cards[0]?.name}`)
    } else {
      console.log(`❌ 失敗: ${basicResult.error}`)
    }

    // テスト2: URLエンコードされたgameTitle検索
    console.log('\n📋 テスト2: URLエンコード検索')
    const encodedTest = await fetch('http://localhost:3001/api/cards?gameTitle=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%82%AB%E3%83%BC%E3%83%89&page=1&limit=5')
    const encodedResult = await encodedTest.json()
    
    console.log(`ステータス: ${encodedTest.status}`)
    if (encodedResult.success) {
      console.log(`✅ 成功 - 検索結果: ${encodedResult.data.cards.length}枚`)
      console.log(`総カード数: ${encodedResult.data.pagination.totalCount}枚`)
    } else {
      console.log(`❌ 失敗: ${encodedResult.error}`)
    }

    // テスト3: カード名での検索
    console.log('\n📋 テスト3: カード名検索（ピカチュウ）')
    const nameTest = await fetch('http://localhost:3001/api/cards?gameTitle=ポケモンカード&name=ピカチュウ&page=1&limit=5')
    const nameResult = await nameTest.json()
    
    console.log(`ステータス: ${nameTest.status}`)
    if (nameResult.success) {
      console.log(`✅ 成功 - 検索結果: ${nameResult.data.cards.length}枚`)
      nameResult.data.cards.forEach((card: any, index: number) => {
        console.log(`  ${index + 1}. ${card.name} (${card.gameTitle})`)
      })
    } else {
      console.log(`❌ 失敗: ${nameResult.error}`)
    }

    // テスト4: 総カード数確認
    console.log('\n📋 テスト4: 全カード検索')
    const allTest = await fetch('http://localhost:3001/api/cards?page=1&limit=1')
    const allResult = await allTest.json()
    
    console.log(`ステータス: ${allTest.status}`)
    if (allResult.success) {
      console.log(`✅ 全カード数: ${allResult.data.pagination.totalCount}枚`)
    } else {
      console.log(`❌ 失敗: ${allResult.error}`)
    }

  } catch (error) {
    console.error('❌ APIテストでエラーが発生:', error)
  }
}

testLocalAPI()