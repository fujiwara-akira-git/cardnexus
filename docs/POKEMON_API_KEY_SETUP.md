# Pokemon TCG API キー設定ガイド

## 🔑 APIキー取得手順

### 1. アカウント作成
1. https://dev.pokemontcg.io/ にアクセス
2. 右上の「Sign Up」をクリック
3. 必要な情報を入力してアカウント作成

### 2. APIキー生成
1. ログイン後、ダッシュボードに移動
2. 「API Keys」セクションでキーを生成
3. キーの名前を設定（例：Card Nexus Production）
4. 生成されたAPIキーをコピー

### 3. 環境変数設定
APIキーを`.env.local`に追加：

```bash
# Pokemon TCG API設定
POKEMON_TCG_API_URL=https://api.pokemontcg.io/v2
POKEMON_TCG_API_KEY=your_api_key_here
```

## 📊 APIキー使用時の利点

### レート制限比較
| 項目 | APIキーなし | APIキー使用 |
|------|-------------|-------------|
| **リクエスト/分** | 60回 | 300回 |
| **リクエスト/時** | 1,000回 | 20,000回 |
| **リクエスト/日** | 20,000回 | 500,000回 |

### パフォーマンス向上
- **取得速度**: 5倍高速化
- **安定性**: タイムアウト大幅減少
- **データ量**: 大規模取得が実用的に

## 🚀 最適化設定

APIキー使用時の推奨設定：

```typescript
// 高速取得設定
const PAGE_SIZE = 100; // 100枚/ページ（最大）
const REQUEST_DELAY = 1000; // 1秒間隔
const TIMEOUT = 30000; // 30秒
const MAX_RETRIES = 3;
```

## 📈 取得時間予測

### Gレギュレーション（1,639枚）
- **APIキーなし**: 約8時間
- **APIキー使用**: 約1.5時間

### 全レギュレーション（5,727枚）
- **APIキーなし**: 約28時間
- **APIキー使用**: 約5時間

## 🔧 実装例

APIキー設定後の高速取得スクリプト使用：

```bash
# 高速Gレギュレーション取得
npm run fetch:fast G

# 全レギュレーション並列取得
npm run fetch:all
```