# Vercel Environment Variables Setup

## 🚀 Vercel Dashboard での環境変数設定

以下の環境変数をVercel Dashboardで設定してください：

### 1. Vercel Dashboard にアクセス
- https://vercel.com/dashboard
- あなたのCard Nexusプロジェクトを選択

### 2. 環境変数を設定
`Settings` → `Environment Variables` で以下を追加：

#### Required Variables

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_2EBhCms9gLiA@ep-winter-fog-ad5cgr4o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Production |
| `NEXTAUTH_URL` | `https://your-cardnexus-app.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `8f3a4b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0` | Production |

#### Optional OAuth Variables (設定済みの場合のみ)

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | `your-google-client-id` | Production |
| `GOOGLE_CLIENT_SECRET` | `your-google-client-secret` | Production |
| `DISCORD_CLIENT_ID` | `your-discord-client-id` | Production |
| `DISCORD_CLIENT_SECRET` | `your-discord-client-secret` | Production |

### 3. 設定手順

1. **Variable Name** に変数名を入力
2. **Value** に対応する値を貼り付け
3. **Environment** で `Production` を選択
4. `Save` をクリック

### 4. デプロイ準備完了 ✅

環境変数設定後、以下のコマンドでデプロイ：

```bash
git add .
git commit -m "feat: configure Neon database for production"
git push origin main
```

Vercelが自動的にデプロイを開始し、Neonデータベースに接続します。

## 🔧 ローカル開発環境の切り替え

### Neon本番データベースを使用（現在の設定）
```env
DATABASE_URL="postgresql://neondb_owner:npg_2EBhCms9gLiA@ep-winter-fog-ad5cgr4o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### ローカルDockerデータベースに戻す場合
```env
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"
```

## 📊 Neon Database Status

✅ **スキーマプッシュ完了**: 全テーブル作成済み  
✅ **サンプルデータ投入完了**: 8種類のポケモンカード + 価格データ  
✅ **接続テスト成功**: PostgreSQL 17.5 で動作中  
✅ **本番環境準備完了**: Vercelデプロイ可能  

## 🚀 次のアクション

1. Vercel Dashboard で環境変数を設定
2. `NEXTAUTH_URL` を実際のVercel URLに更新
3. OAuth設定（必要に応じて）
4. デプロイ実行

これで Card Nexus が Neon Database で本番運用できます！