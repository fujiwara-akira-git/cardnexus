# Vercel Deployment Guide

## 🚀 Vercel Dashboard での環境変数設定手順

### 1. Vercel Dashboard にアクセス
1. https://vercel.com/dashboard にアクセス
2. Card Nexus プロジェクトを選択
3. `Settings` タブをクリック
4. 左メニューから `Environment Variables` を選択

### 2. 必須環境変数の設定

以下の環境変数を **Production** 環境に設定してください：

#### Database (Neon)
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_2EBhCms9gLiA@ep-winter-fog-ad5cgr4o-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: Production
```

#### NextAuth.js
```  
Name: NEXTAUTH_URL
Value: https://your-cardnexus-app.vercel.app
Environment: Production

Name: NEXTAUTH_SECRET  
Value: 8f3a4b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0
Environment: Production
```

#### OAuth (オプション - 設定済みの場合のみ)
```
Name: GOOGLE_CLIENT_ID
Value: your-google-client-id
Environment: Production

Name: GOOGLE_CLIENT_SECRET
Value: your-google-client-secret  
Environment: Production

Name: DISCORD_CLIENT_ID
Value: your-discord-client-id
Environment: Production

Name: DISCORD_CLIENT_SECRET
Value: your-discord-client-secret
Environment: Production
```

### 3. デプロイ実行

環境変数設定後、以下のコマンドでデプロイ：

```bash
# Vercel Dashboard設定後
vercel --prod

# または自動デプロイ（GitHub連携済みの場合）
git push origin main
```

### 4. デプロイ後の確認事項

#### ✅ データベース接続確認
- Vercel Function Logs でデータベース接続エラーがないかチェック
- `/api/cards` エンドポイントでデータ取得テスト

#### ✅ 認証機能確認  
- サインアップ・サインイン画面の表示
- NextAuth.js の動作確認

#### ✅ 主要機能確認
- カードデータベース表示 (`/cards`)
- デッキビルダー機能 (`/decks/builder`)
- コミュニティボード (`/board`)
- 売買掲示板 (`/listings`)

### 5. カスタムドメイン設定（オプション）

1. Vercel Dashboard の `Settings` → `Domains`
2. カスタムドメインを追加
3. DNS設定でCNAMEレコードを追加
4. `NEXTAUTH_URL` を新しいドメインに更新

### 6. トラブルシューティング

#### デプロイエラーの場合
```bash
# ログ確認
vercel logs

# 環境変数確認
vercel env ls

# 強制再デプロイ
vercel --prod --force
```

#### データベース接続エラーの場合
- Neon Database の接続文字列を再確認
- DATABASE_URL の形式を確認（特殊文字のエスケープ）
- Neon Dashboard でデータベースの稼働状況を確認

---

## 🎯 デプロイ準備完了チェックリスト

- [x] Next.js 15 対応完了
- [x] API Routes 修正完了  
- [x] ビルドエラー解消
- [x] Neon Database 準備完了
- [x] スキーマ同期確認済み
- [x] 環境変数テンプレート作成済み
- [ ] Vercel Dashboard 環境変数設定
- [ ] 本番デプロイ実行
- [ ] 動作確認

**Card Nexus は Vercel デプロイの準備が完了しています！** 🚀