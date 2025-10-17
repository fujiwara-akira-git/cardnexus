/**
 * Pokemon TCG API キー設定確認スクリプト
 */

import 'dotenv/config';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env.localファイルを読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;

async function checkApiKeyStatus() {
  console.log('============================================================');
  console.log('Pokemon TCG API キー設定確認');
  console.log('============================================================\n');

  console.log(`🌐 API URL: ${API_BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY ? `設定済み (${API_KEY.slice(0, 8)}...)` : '未設定'}\n`);

  if (!API_KEY) {
    console.log('⚠️  APIキーが設定されていません\n');
    console.log('📋 APIキー設定手順:');
    console.log('1. https://dev.pokemontcg.io/ でアカウント作成');
    console.log('2. APIキーを生成');
    console.log('3. .env.local に以下を追加:');
    console.log('   POKEMON_TCG_API_KEY=your_api_key_here\n');
    
    console.log('📊 現在の制限（APIキーなし）:');
    console.log('   • 60 リクエスト/分');
    console.log('   • 1,000 リクエスト/時');
    console.log('   • 20,000 リクエスト/日\n');
  }

  // レート制限テスト
  console.log('🧪 レート制限テスト中...\n');

  const testRequests = API_KEY ? 5 : 3; // APIキー有無で調整
  const results = [];

  for (let i = 1; i <= testRequests; i++) {
    const startTime = Date.now();
    
    try {
      console.log(`📡 テストリクエスト ${i}/${testRequests}...`);
      
      const response = await axios.get(`${API_BASE_URL}/cards`, {
        params: { 
          pageSize: 1,
          page: i 
        },
        headers: {
          'User-Agent': 'Card Nexus API Key Test/1.0',
          ...(API_KEY ? { 'X-Api-Key': API_KEY } : {})
        },
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;
      results.push({
        request: i,
        status: response.status,
        responseTime,
        success: true
      });

      console.log(`✅ 成功 (${responseTime}ms) - ${response.data.data[0]?.name || 'カード取得'}`);
      
      // リクエスト間隔調整
      if (i < testRequests) {
        const delay = API_KEY ? 500 : 2000; // APIキー有無で調整
        console.log(`⏳ ${delay}ms待機...\n`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        results.push({
          request: i,
          status: status || 'timeout',
          responseTime,
          success: false,
          error: status === 429 ? 'レート制限' : error.message
        });

        if (status === 429) {
          console.log(`❌ レート制限に達しました (${responseTime}ms)`);
          break;
        } else {
          console.log(`❌ エラー (${responseTime}ms): ${error.message}`);
        }
      }
    }
  }

  // 結果分析
  console.log('\n============================================================');
  console.log('📊 テスト結果分析');
  console.log('============================================================\n');

  const successCount = results.filter(r => r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

  console.log(`✅ 成功率: ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(1)}%)`);
  console.log(`⏱️  平均応答時間: ${avgResponseTime.toFixed(0)}ms`);

  if (API_KEY) {
    console.log('\n🚀 APIキー使用中 - 高速取得モード利用可能!');
    console.log('📈 推奨設定:');
    console.log('   • ページサイズ: 100枚');
    console.log('   • リクエスト間隔: 1秒');
    console.log('   • 予想取得時間: 大幅短縮');
    
    console.log('\n🎯 高速取得実行例:');
    console.log('   npm run fetch:fast G  # Gレギュレーション高速取得');
    console.log('   npm run fetch:fast H  # Hレギュレーション高速取得');
    console.log('   npm run fetch:fast I  # Iレギュレーション高速取得');
    
  } else {
    console.log('\n⚠️  安全モード - APIキー設定を推奨');
    console.log('📉 現在の設定:');
    console.log('   • ページサイズ: 25枚');
    console.log('   • リクエスト間隔: 5秒');
    console.log('   • 予想取得時間: 長時間');
  }

  console.log('\n============================================================');
}

checkApiKeyStatus().catch(console.error);