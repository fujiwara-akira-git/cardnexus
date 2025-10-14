# Card Nexus 開発クイックリファレンス 🚀

## データベース操作

### Docker環境
```bash
# DB起動
docker-compose up -d

# DB停止  
docker-compose down

# DB接続
docker exec -it cardnexus-postgres psql -U cardnexus_user -d cardnexus

# ログ確認
docker logs cardnexus-postgres
```

### Prisma操作
```bash
# マイグレーション実行
npx prisma migrate dev --name feature_name

# Studio起動（DB管理GUI）
npx prisma studio

# スキーマ確認
npx prisma migrate status

# DB完全リセット（開発時のみ）
npx prisma migrate reset
```

## 開発サーバー

### 起動・停止
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start
```

### コード品質
```bash
# ESLint実行
npm run lint

# TypeScript型チェック
npx tsc --noEmit
```

## 認証・ユーザー管理

### テストユーザー作成
サインアップページ: `http://localhost:3001/auth/signup`

### 認証状態確認
ダッシュボード: `http://localhost:3001/dashboard`

## よく使うURL

- **ホーム**: http://localhost:3001/
- **サインアップ**: http://localhost:3001/auth/signup  
- **サインイン**: http://localhost:3001/auth/signin
- **ダッシュボード**: http://localhost:3001/dashboard
- **Prisma Studio**: http://localhost:5555/

## 環境変数チェックリスト

### 必須項目（.env.local）
```env
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="dev-secret-key"
```

### オプション項目
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."
```

## トラブルシューティング

### 接続エラー時
```bash
# Docker状態確認
docker ps | grep cardnexus

# ポート確認
lsof -i :5433

# 環境変数確認  
cat .env.local
```

### DB問題の解決
```bash
# Prisma再生成
rm -rf node_modules/.prisma
npx prisma generate

# 完全リセット
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init
```

---
更新日: 2025年10月14日