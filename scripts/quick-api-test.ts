/**
 * Pokemon TCG API 軽量接続テスト
 */

import 'dotenv/config';
import axios from 'axios';

const API_BASE_URL = process.env.POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;

async function quickTest() {
  console.log('Pokemon TCG API 軽量テスト開始...');
  console.log(`API URL: ${API_BASE_URL}`);
  console.log(`API Key: ${API_KEY ? '設定済み' : '未設定'}`);

  try {
    // 基本テスト
    console.log('\n1. 基本接続テスト...');
    const basicResponse = await axios.get(`${API_BASE_URL}/cards`, {
      params: { pageSize: 1 },
      timeout: 30000,
      headers: API_KEY ? { 'X-Api-Key': API_KEY } : {}
    });
    console.log(`✅ 成功: ${basicResponse.data.data[0]?.name}`);

    // レギュレーション別テスト  
    for (const reg of ['G', 'H', 'I']) {
      console.log(`\n2. ${reg}レギュレーションテスト...`);
      const regResponse = await axios.get(`${API_BASE_URL}/cards`, {
        params: {
          q: `regulationMark:${reg}`,
          pageSize: 5
        },
        timeout: 30000,
        headers: API_KEY ? { 'X-Api-Key': API_KEY } : {}
      });
      
      const { totalCount, data } = regResponse.data;
      console.log(`✅ ${reg}: ${totalCount}枚 (サンプル: ${data.map((c: {name: string}) => c.name).join(', ')})`);
    }

    console.log('\n🎉 すべてのテストが成功しました！');
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ エラー:', error.message);
    } else {
      console.error('❌ 予期しないエラー:', error);
    }
    
    if (axios.isAxiosError(error)) {
      console.error(`   ステータス: ${error.response?.status}`);
      const dataStr = error.response?.data ? JSON.stringify(error.response.data) : 'データなし';
      console.error(`   データ: ${dataStr.slice(0, 200)}...`);
    }
  }
}

quickTest();