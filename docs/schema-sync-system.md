# Database Schema Synchronization & Validation

## 🎯 概要

Card Nexusでは、ローカル開発環境（Docker）と本番環境（Neon）でデータベーススキーマの一致を自動的に保証するシステムを構築しています。

## 🛠️ 自動化されたスキーマ保証システム

### 1. 🔍 自動スキーマ検証スクリプト

#### `scripts/validate-schema.sh`
```bash
# 基本的なスキーマ検証
npm run db:validate

# ローカルDB のみ検証
./scripts/validate-schema.sh local

# Neon DB のみ検証
./scripts/validate-schema.sh neon

# マイグレーション状態確認
./scripts/validate-schema.sh migrate
```

**検証内容**:
- ✅ データベース接続確認
- ✅ テーブル数の一致確認  
- ✅ 各テーブルのスキーマ構造比較
- ✅ マイグレーション状態確認

### 2. 🚀 GitHub Actions 自動検証

#### `.github/workflows/schema-validation.yml`
```yaml
# 自動実行タイミング
- Push to main/develop branch (Prisma変更時)
- Pull Request作成時  
- 手動実行 (workflow_dispatch)
```

**検証フロー**:
1. テスト用PostgreSQLコンテナ起動
2. Prismaマイグレーション適用
3. ローカルスキーマ検証
4. Neonスキーマ検証（利用可能な場合）
5. 検証結果レポート

### 3. 🎣 Pre-commitフック

#### `scripts/pre-commit-hook.sh`
```bash
# Git commit前の自動検証
git commit -m "..."
# → 自動的にスキーマ検証実行
```

**動作条件**:
- Prismaファイル変更検出時のみ実行
- 検証失敗時はコミットを自動ブロック
- 修正方法も自動表示

## 📋 利用可能なコマンド

### 基本コマンド

| コマンド | 説明 |
|---------|------|
| `npm run db:validate` | スキーマ検証実行 |
| `npm run db:status` | マイグレーション状態確認 |
| `npm run db:sync` | スキーマ強制同期 |
| `npm run pre-commit` | コミット前検証実行 |
| `npm run deploy:validate` | デプロイ前検証 |

### 緊急時コマンド

| コマンド | 説明 |
|---------|------|
| `npm run db:reset:local` | ローカルDB完全リセット |
| `npm run db:reset:neon` | NeonDB完全リセット ⚠️ |

## 🔧 環境変数設定

### ローカル開発環境
```env
# .env.local
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"

# Neon検証用（オプション）
NEON_DATABASE_URL="postgresql://neondb_owner:xxx@xxx.neon.tech/neondb?sslmode=require"
```

### GitHub Actions
```env
# Repository Secrets
DATABASE_URL: "production neon url"
NEON_DATABASE_URL: "production neon url"  
```

### Vercel
```env
# Environment Variables  
DATABASE_URL: "production neon url"
```

## 🚨 トラブルシューティング

### スキーマ不一致が検出された場合

#### 1. 状態確認
```bash
npm run db:status
```

#### 2. 手動同期
```bash
npm run db:sync
```

#### 3. 完全リセット（最終手段）
```bash
# ローカルのみ
npm run db:reset:local

# Neon（要注意！）
npm run db:reset:neon
```

### よくある問題と解決策

#### ❌ "Table count mismatch"
```bash
# 原因: テーブル数が一致していない
# 解決: マイグレーション適用
DATABASE_URL="$NEON_DATABASE_URL" npx prisma migrate deploy
```

#### ❌ "Migration status out of sync"
```bash
# 原因: マイグレーション履歴の不整合
# 解決: 履歴同期
DATABASE_URL="$NEON_DATABASE_URL" npx prisma migrate resolve --applied "migration_name"
```

#### ❌ "Connection failed"
```bash
# 原因: データベース接続エラー
# 解決: 
# - Docker: docker-compose up -d
# - Neon: DATABASE_URL確認
```

## 🎯 ベストプラクティス

### 1. 開発フロー
```bash
# 1. Prismaスキーマ変更
vim prisma/schema.prisma

# 2. ローカルマイグレーション作成
npx prisma migrate dev --name "add_new_feature"

# 3. スキーマ検証
npm run db:validate

# 4. コミット（自動検証実行）
git add .
git commit -m "feat: add new feature schema"

# 5. プッシュ（GitHub Actions自動実行）
git push origin main
```

### 2. Vercelデプロイ前
```bash
# デプロイ前検証
npm run deploy:validate

# すべてOKならデプロイ
vercel --prod
```

### 3. 定期メンテナンス
```bash
# 週次でスキーマ状態確認
npm run db:validate
npm run db:status
```

## ✅ システムの利点

- 🚀 **自動化**: コミット・デプロイ時の自動検証
- 🔒 **安全性**: スキーマ不一致による障害を事前防止
- 📊 **可視性**: GitHub ActionsでCI/CD統合
- 🛠️ **保守性**: スクリプト化された検証・修復コマンド
- ⚡ **効率性**: 開発者の手動確認作業を削減

このシステムにより、Card Nexusは常にスキーマの一致を保ったまま安全にデプロイできます！