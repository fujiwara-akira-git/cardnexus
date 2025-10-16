# Pokemon TCG API 統合ガイド

## 概要
Card NexusにPokemon TCG APIを統合し、G、H、Iレギュレーションのカードデータを自動的に取得・登録できるようになりました。

## 実装された機能

### 1. データベーススキーマの拡張
`Card`モデルに以下のフィールドを追加しました：

- `apiId`: Pokemon TCG APIのカードID（ユニーク）
- `regulationMark`: レギュレーションマーク（G、H、I）
- `cardType`: カードタイプ（Pokémon、Trainer、Energy）
- `hp`: ポケモンのHP
- `types`: ポケモンのタイプ（複数の場合はカンマ区切り）
- `evolveFrom`: 進化元のポケモン名
- `artist`: イラストレーター名
- `subtypes`: サブタイプ（複数の場合はカンマ区切り）
- `releaseDate`: リリース日

### 2. データ取得スクリプト
**ファイル**: `scripts/fetch-pokemon-cards.ts`

Pokemon TCG APIからG、H、Iレギュレーションのカードデータを取得します。

**機能**:
- レギュレーションマーク別にカードデータを取得
- エラーハンドリングとリトライ機能
- レート制限対策
- データを`data/pokemon-cards/`ディレクトリにJSON形式で保存

### 3. データインポートスクリプト
**ファイル**: `scripts/import-pokemon-cards.ts`

取得したJSONデータをデータベースに登録します。

**機能**:
- カード番号と拡張パックで重複チェック
- 既存カードは更新、新規カードは追加
- 進捗表示とエラーハンドリング
- インポート統計情報の表示

### 4. カード検索API拡張
**エンドポイント**: `/api/cards`

以下のクエリパラメータを追加しました：

- `regulationMark`: レギュレーションマーク（G、H、I）でフィルタリング
- `cardType`: カードタイプ（Pokémon、Trainer、Energy）でフィルタリング

**例**:
```
GET /api/cards?regulationMark=G&cardType=Pokémon
GET /api/cards?name=ピカチュウ&regulationMark=H
```

### 5. カード検索UI強化
**ページ**: `/cards`

詳細フィルターに以下を追加：

- レギュレーション選択（G、H、I）
- カードタイプ選択（ポケモン、トレーナー、エネルギー）
- カード一覧に各種情報のバッジ表示
  - レギュレーションマーク（青色）
  - カードタイプ（紫色）
  - HP表示（赤色）
  - タイプ表示

## セットアップ手順

### 1. 依存パッケージのインストール
```bash
npm install
```

### 2. データベースマイグレーション
データベースに新しいフィールドを追加します：

```bash
npx prisma migrate dev --name add_pokemon_card_fields
```

### 3. Prismaクライアントの生成
```bash
npx prisma generate
```

### 4. Pokemon TCG APIキーの設定（オプション）
APIキーがなくても動作しますが、レート制限を緩和するために推奨します。

`.env`ファイルに追加：
```env
POKEMON_TCG_API_KEY=your_api_key_here
```

APIキーの取得: https://pokemontcg.io/

### 5. カードデータの取得とインポート

#### オプション1: 一括実行（推奨）
```bash
npm run setup:cards
```

#### オプション2: 個別実行
```bash
# カードデータの取得
npm run fetch:cards

# データベースへのインポート
npm run import:cards
```

### 実行時間の目安
- データ取得: 約10-15分（G、H、I合計で約2000-3000枚）
- インポート: 約3-5分

## データ管理

### データの更新
新しいカードが追加された場合や、データを最新化したい場合：

```bash
npm run setup:cards
```

既存のカードは自動的に更新され、新しいカードが追加されます。

### データの確認
```bash
# データベース内のカード総数を確認
npx prisma studio
```

または、インポートスクリプト実行時に統計情報が表示されます。

### 保存されるJSONファイル
- `data/pokemon-cards/regulation-G.json`
- `data/pokemon-cards/regulation-H.json`
- `data/pokemon-cards/regulation-I.json`

## トラブルシューティング

### データベース接続エラー
```
Error: P1000: Authentication failed against database server
```

**解決方法**:
1. `.env`ファイルの`DATABASE_URL`を確認
2. PostgreSQLが起動しているか確認
3. データベースの認証情報を確認

### API レート制限エラー
```
Error: 429 - Rate limit exceeded
```

**解決方法**:
1. Pokemon TCG APIキーを設定（`.env`ファイル）
2. スクリプトは自動的にリトライしますが、しばらく待ってから再実行

### タイムアウトエラー
```
Error: ECONNABORTED - Timeout
```

**解決方法**:
- ネットワーク接続を確認
- スクリプトは自動的にリトライします
- リトライが失敗する場合は、しばらく待ってから再実行

## カスタマイズ

### 他のレギュレーションを追加
`scripts/fetch-pokemon-cards.ts`の`regulations`配列を編集：

```typescript
const regulations = ['G', 'H', 'I', 'J']; // Jを追加
```

### 取得するカードの条件変更
`fetchCardsByRegulation`関数のクエリパラメータを変更：

```typescript
params: {
  q: `regulationMark:${regulation} supertype:Pokémon`, // ポケモンのみ取得
  page,
  pageSize: 250,
}
```

### カード情報の追加フィールド
必要に応じて`normalizeAndSaveCards`関数でフィールドを追加できます。

## API リファレンス

### Pokemon TCG API
- ドキュメント: https://docs.pokemontcg.io/
- エンドポイント: https://api.pokemontcg.io/v2
- レート制限: 
  - APIキーなし: 20,000リクエスト/日
  - APIキーあり: 20,000リクエスト/時間

### 主なクエリパラメータ
- `regulationMark`: G, H, I, J など
- `supertype`: Pokémon, Trainer, Energy
- `subtypes`: Basic, Stage 1, Stage 2, VSTAR, VMAX, など
- `types`: Grass, Fire, Water, Lightning, など
- `name`: カード名（部分一致）
- `set.name`: 拡張パック名

## パフォーマンス最適化

### データベースインデックス
頻繁に検索されるフィールドにインデックスを追加することで、検索パフォーマンスが向上します。

`prisma/schema.prisma`に追加:
```prisma
model Card {
  // ... existing fields
  
  @@index([regulationMark])
  @@index([cardType])
  @@index([gameTitle, regulationMark])
}
```

マイグレーション実行:
```bash
npx prisma migrate dev --name add_card_indexes
```

### バッチ処理の最適化
大量のカードを処理する場合は、`import-pokemon-cards.ts`でバッチ処理を実装できます。

## 次のステップ

1. **価格情報の自動取得**: TCGPlayer APIとの連携
2. **定期的なデータ更新**: cronジョブやGitHub Actionsでの自動実行
3. **画像のキャッシング**: カード画像のローカルキャッシュ
4. **フルテキスト検索**: PostgreSQLのフルテキスト検索機能の活用
5. **カードの詳細ページ**: 個別カードページでの詳細情報表示

## サポート

問題が発生した場合は、以下を確認してください：
- エラーログの内容
- データベースの状態
- ネットワーク接続
- Pokemon TCG APIのステータス

詳細なログが必要な場合は、スクリプトを直接実行：
```bash
tsx scripts/fetch-pokemon-cards.ts
tsx scripts/import-pokemon-cards.ts
```
