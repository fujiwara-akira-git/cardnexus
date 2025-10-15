# Neon Database Setup for Card Nexus

## 1. Neon アカウント作成・データベース作成

### アカウント作成
1. https://neon.tech/ にアクセス
2. 「Sign up」でGitHubアカウントでサインアップ
3. 無料プランを選択

### データベース作成
1. Dashboard で「Create Project」をクリック
2. プロジェクト設定:
   - **Project name**: `cardnexus-production`
   - **Database name**: `cardnexus`
   - **Region**: `Asia Pacific (Singapore)` （日本に最も近い）
   - **PostgreSQL version**: `16` (最新推奨)

### 接続文字列の取得
1. 作成されたプロジェクトのDashboardにアクセス
2. 「Connection Details」セクションから接続文字列をコピー
3. 形式: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

## 2. Vercel環境変数設定

Vercel Dashboard の Environment Variables で以下を設定:

```env
# Neon Database URL
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

## 3. データベース初期化

### 本番データベースでのマイグレーション

```bash
# ローカル環境変数を一時的に本番用に設定
export DATABASE_URL="postgresql://[neon-connection-string]"

# マイグレーション実行
npx prisma migrate deploy

# サンプルデータ投入（オプション）
npx tsx src/lib/sample-cards.ts
npx tsx src/lib/sample-posts.ts  
npx tsx src/lib/sample-decks.ts
```

### Vercelビルド時の自動マイグレーション

`package.json` の `vercel-build` スクリプトが以下を自動実行:
1. `prisma generate` - Prismaクライアント生成
2. `prisma migrate deploy` - マイグレーション適用
3. `next build` - Next.jsビルド

## 4. Neonの特徴・利点

### 無料プラン制限
- **データベースサイズ**: 512 MB
- **接続数**: 1つのブランチあたり最大60接続
- **ストレージ**: 3 GiB
- **アクティブ時間**: 月100時間

### ブランチング機能
本番・開発・テスト用に複数のデータベースブランチを作成可能:

```bash
# 新しいブランチ作成
neon branches create --name development
neon branches create --name staging
```

### サーバーレス・スケーリング
- 自動スリープ・ウェイクアップ
- 使用量に応じた自動スケーリング
- Vercelとの高い親和性

## 5. 推奨設定

### 接続プーリング
Neonでは自動的にコネクションプーリングが有効になりますが、
Prismaの設定も最適化推奨:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 環境別設定
```env
# Development (Local Docker)
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus"

# Production (Neon)  
DATABASE_URL="postgresql://neon_user:password@ep-xxx.us-east-1.aws.neon.tech/cardnexus?sslmode=require"
```

## 6. モニタリング・メンテナンス

### Neon Dashboard
- SQL Editor でクエリ実行
- Usage analytics で使用量確認
- ログ・メトリクス監視

### Prisma Studio (本番用)
```bash
# 本番データベースでPrisma Studio起動（注意して使用）
DATABASE_URL="postgresql://neon..." npx prisma studio
```

## 7. バックアップ・災害復旧

### 自動バックアップ
- Neonは自動的にポイントインタイム復旧をサポート
- 最大7日間のバックアップ保持（無料プラン）

### 手動バックアップ
```bash
# データベースダンプ作成
pg_dump "postgresql://neon-connection-string" > cardnexus_backup.sql

# リストア
psql "postgresql://neon-connection-string" < cardnexus_backup.sql
```

## 8. パフォーマンス最適化

### インデックス最適化
```sql
-- よく検索されるカラムにインデックス作成
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_posts_category ON posts(category);
```

### クエリ最適化
Prismaクエリの最適化:
```typescript
// 効率的なクエリ例
const cards = await prisma.card.findMany({
  select: {
    id: true,
    name: true,
    imageUrl: true,
    // 必要なフィールドのみ選択
  },
  take: 20, // LIMIT
  skip: (page - 1) * 20, // OFFSET
})
```

---

この設定により、Card NexusをNeonデータベースでスケーラブルに運用できます。