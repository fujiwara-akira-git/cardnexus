/**
 * Pokemon TCG API テストスクリプト
 */

import 'dotenv/config';
import axios from 'axios';

const API_BASE_URL = process.env.POKEMON_TCG_API_URL;
const API_KEY = process.env.POKEMON_TCG_API_KEY;

async function testApi() {
  console.log('Pokemon TCG API テスト開始...');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('API_KEY:', API_KEY ? 'あり' : 'なし');

  try {
    console.log('\n1. 基本的なカード取得テスト...');
    const basicResponse = await axios.get(`${API_BASE_URL}/cards`, {
      params: {
        pageSize: 1,
      },
      headers: API_KEY ? { 'X-Api-Key': API_KEY } : {},
      timeout: 30000,
    });
    console.log('✓ 基本テスト成功:', basicResponse.data.data[0]?.name);

    console.log('\n2. Gレギュレーション取得テスト...');
    const gRegulationResponse = await axios.get(`${API_BASE_URL}/cards`, {
      params: {
        q: 'regulationMark:G',
        pageSize: 1,
      },
      headers: API_KEY ? { 'X-Api-Key': API_KEY } : {},
      timeout: 30000,
    });
    console.log('✓ Gレギュレーションテスト成功:');
    console.log('  - 総数:', gRegulationResponse.data.totalCount);
    console.log('  - サンプルカード:', gRegulationResponse.data.data[0]?.name);

    console.log('\nすべてのテストが成功しました！');
  } catch (error) {
    if (error instanceof Error) {
      console.error('テストでエラーが発生:', error.message);
    } else {
      console.error('テストでエラーが発生:', error);
    }
    
    if (axios.isAxiosError(error)) {
      console.error('レスポンス:', error.response?.data);
      console.error('ステータス:', error.response?.status);
    }
  }
}

testApi();