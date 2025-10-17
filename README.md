# Card Nexus 🃏

カードゲームプレイヤーのための情報交換・取引プラットフォーム

**🌐 本番サイト**: [https://cardnexus.vercel.app](https://cardnexus.vercel.app)

「すべてのカードゲームプレイヤーが集う、情報と交流の拠点（ハブ）」をコンセプトとした、Next.js製のフルスタックWebアプリケーションです。

## 🎯 プロジェクト概要

Card Nexusは、カードゲーム愛好者が以下の活動を一つのプラットフォームで行えるサービスです：

- 📚 **カードデータベース**: ポケモンカード等の詳細情報検索 ✅
- 💰 **価格トラッカー**: リアルタイム相場情報の確認 ✅
- 🛒 **売買掲示板**: ユーザー間でのカード売買・交換 ✅
- 👤 **ユーザープロフィール**: 個人情報・取引履歴の管理 ✅
- ⭐ **評価システム**: 安全な取引のための信頼性評価 🚧
- 🎴 **デッキ共有**: オリジナルデッキレシピの投稿・閲覧 📋

**凡例**: ✅ 実装完了 | 🚧 開発中 | 📋 計画中

## � 実装済み機能

### ✅ 認証・ユーザー管理
- NextAuth.js による認証システム
- Google / Discord OAuth ログイン
- ユーザープロフィール管理（編集・表示）
- プロフィール画像・自己紹介設定

### ✅ カードデータベース
- ポケモンカード情報検索 (`/cards`)
- 詳細なカード情報表示 (`/cards/[id]`)
- 価格履歴・統計情報
- フィルター・ソート機能
- 画像表示・レア度表示

### ✅ 売買・取引システム
- 出品作成機能 (`/listings/create`)
  - 売る・買う・交換の3タイプ対応
  - リアルタイムカード検索・選択
  - 価格設定・状態選択・説明入力
- 出品一覧表示 (`/listings`)
  - グリッドレイアウト表示
  - 種別フィルター（出品/求購/交換）
  - カード名・説明での検索
  - ページネーション機能
- REST API エンドポイント (`/api/listings`)
  - 認証・バリデーション付き
  - TypeScript型安全性保証

### ✅ ダッシュボード
- ユーザー専用ダッシュボード (`/dashboard`)
- アクティブな出品一覧
- 通知センター（モック）
- 簡単アクション（出品作成・カード検索）

### ✅ 技術基盤
- PostgreSQL + Prisma ORM
- Docker開発環境
- TypeScript厳密型チェック
- レスポンシブデザイン

## �🛠 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript** - 型安全性
- **Tailwind CSS** - ユーティリティファーストCSS
- **React Hook Form** - フォーム管理

### バックエンド
- **Next.js API Routes** - サーバーサイドAPI
- **NextAuth.js** - 認証・セッション管理
- **Prisma ORM** - データベース操作

### データベース
- **PostgreSQL** - メインデータベース
- **Prisma Schema** - データベーススキーマ管理

## 📁 プロジェクト構造

```
cardnexus/
├── src/
│   ├── app/              # App Routerページ
│   │   ├── api/          # APIルート
│   │   └── auth/         # 認証ページ
│   ├── components/       # 再利用可能コンポーネント
│   ├── lib/             # ユーティリティ・設定
│   ├── types/           # TypeScript型定義
│   └── hooks/           # カスタムフック
├── prisma/              # データベーススキーマ
├── public/              # 静的ファイル
├── docs/                # プロジェクト文書
└── .github/             # GitHub設定
```

## 🚀 開発環境セットアップ

### 必要要件

- Node.js 18.x 以上
- npm または yarn
- Docker & Docker Compose（推奨）
- PostgreSQL（Dockerを使用しない場合）

## 🌐 本番環境（プロダクション）

### 📱 **本番サイト**
- **メインURL**: https://cardnexus.vercel.app
- **デプロイ先**: Vercel Platform
- **データベース**: Neon PostgreSQL
- **最終デプロイ**: 2024年10月16日 11:32 JST
- **ビルドステータス**: ✅ 成功
- **機能確認**: ✅ 全機能動作確認済み

### 🏗️ **本番インフラ構成**
- **フロントエンド**: Next.js 15.5.5 (App Router)
- **サーバーレス関数**: Vercel Edge Functions
- **データベース**: Neon PostgreSQL (サーバーレス対応)
- **認証**: NextAuth.js (Google/Discord OAuth)
- **CDN**: Vercel Edge Network (グローバル配信)
- **SSL**: 自動SSL証明書 (Let's Encrypt)

### 🔐 **セキュリティ機能**
- HTTPS強制 (HSTS有効)
- NextAuth.js セキュアセッション
- PostgreSQL SSL接続
- CSRF保護
- XSS保護
- 環境変数暗号化

## 🗄️ ローカルデータベース構築

### 方法1: Docker Compose（推奨）

Card Nexus専用のPostgreSQLを簡単にセットアップできます。

1. **Dockerがインストールされていることを確認**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **PostgreSQLコンテナの起動**
   ```bash
   # プロジェクトルートで実行
   docker-compose up -d
   
   # コンテナの状態確認
   docker ps | grep cardnexus
   ```

3. **データベース接続の確認**
   ```bash
   # コンテナ内のPostgreSQLに接続してテスト
   docker exec -it cardnexus-postgres psql -U cardnexus_user -d cardnexus -c "\l"
   ```

#### Docker設定詳細

**使用ポート**: `5433`（既存PostgreSQLと競合回避）  
**データベース名**: `cardnexus`  
**ユーザー名**: `cardnexus_user`  
**パスワード**: `cardnexus_password`  
**データ永続化**: `cardnexus_cardnexus_db_data` Dockerボリューム

#### Dockerコンテナ管理コマンド

```bash
# コンテナ起動
docker-compose up -d

# コンテナ停止
docker-compose down

# データベースログ確認
docker logs cardnexus-postgres

# コンテナ内でSQL実行
docker exec -it cardnexus-postgres psql -U cardnexus_user -d cardnexus

# データベース完全リセット（注意：全データ削除）
docker-compose down -v
docker-compose up -d
```

### 方法2: ローカルPostgreSQL

既存のPostgreSQLを使用する場合の手順です。

1. **PostgreSQL 15のインストール**
   ```bash
   # macOS (Homebrew)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-15 postgresql-client-15
   sudo systemctl start postgresql
   
   # Windows
   # https://www.postgresql.org/download/windows/ からダウンロード
   ```

2. **データベースとユーザーの作成**
   ```sql
   -- PostgreSQLに管理者でログイン
   sudo -u postgres psql
   
   -- Card Nexus用データベースの作成
   CREATE DATABASE cardnexus;
   CREATE USER cardnexus_user WITH PASSWORD 'cardnexus_password';
   GRANT ALL PRIVILEGES ON DATABASE cardnexus TO cardnexus_user;
   
   -- 接続テスト
   \c cardnexus cardnexus_user
   \q
   ```

3. **接続確認**
   ```bash
   psql -h localhost -U cardnexus_user -d cardnexus -c "SELECT version();"
   ```

## 📋 プロジェクトセットアップ手順

### インストール手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/fujiwara-akira-git/cardnexux.git
   cd cardnexus
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   
   `.env`ファイルを作成（`.env.example`をコピー）:
   ```bash
   cp .env.example .env
   ```
   
   `.env`ファイルを編集して、以下の内容を設定:
   ```env
   # Database（Docker使用時）
   DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
   
   # OAuth Providers（オプション）
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   DISCORD_CLIENT_ID="your-discord-client-id"
   DISCORD_CLIENT_SECRET="your-discord-client-secret"
   
   # Pokemon TCG API Key（オプション：レート制限を緩和）
   POKEMON_TCG_API_KEY="your-api-key-here"
   
   # API エンドポイント設定（環境変数として定義）
   POKEMON_TCG_API_URL="https://api.pokemontcg.io/v2"
   YUGIOH_API_URL="https://db.ygoprodeck.com/api/v7"
   ```

   > **重要なセキュリティ事項**: 
   > - `.env`ファイルは`.gitignore`に含まれており、GitHubにプッシュされません
   > - **絶対に`.env`ファイルをコミットしないでください**
   > - APIキーやシークレットキーは必ず環境変数で管理してください
   > - ローカルPostgreSQLを使用する場合は、ポートを`5432`に変更してください
   > - Pokemon TCG APIキーは https://dev.pokemontcg.io/ で取得できます
   > - **APIエンドポイントURLは環境変数として定義されており、ハードコーディングされていません**

4. **Prismaクライアント生成**
   ```bash
   npx prisma generate
   ```

5. **データベースマイグレーション**
   ```bash
   # テーブル作成
   npx prisma migrate dev --name init
   
   # マイグレーション状態の確認
   npx prisma migrate status
   ```

6. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

   ブラウザで `http://localhost:3000` にアクセス

### 🎴 カードデータのインポート

Card Nexusは複数のカードゲームに対応しています。以下のコマンドでカードデータをインポートできます：

#### ポケモンカード
```bash
# G、H、Iレギュレーションのカードデータを取得してインポート
npm run setup:cards
```

#### 遊戯王カード
```bash
# 遊戯王カードデータを取得してインポート（約12,000枚）
npm run setup:yugioh
```

#### すべてのカードデータ
```bash
# ポケモンと遊戯王のカードを一括でセットアップ
npm run setup:all-cards
```

> **注意**: 
> - カードデータのフェッチには時間がかかる場合があります（5-10分程度）
> - Pokemon TCG APIは時々タイムアウトすることがあります。その場合は再実行してください
> - フェッチされたデータは `data/` フォルダに保存されます（.gitignoreに含まれています）

### 🔧 データベース管理

#### Prisma Studio（データベースGUI）

データベースの内容を視覚的に確認・編集できます：

```bash
# Prisma Studio起動
npx prisma studio
```

`http://localhost:5555` でGUIにアクセス可能

#### 開発時のよくある操作

```bash
# スキーマ変更後のマイグレーション
npx prisma migrate dev --name add_new_feature

# データベースリセット（開発時のみ）
npx prisma migrate reset

# データベースの状態確認
npx prisma migrate status

# 本番環境用マイグレーション適用
npx prisma migrate deploy
```

### 🔍 トラブルシューティング

#### データベース接続エラー

1. **Dockerコンテナが起動しているか確認**
   ```bash
   docker ps | grep cardnexus-postgres
   ```

2. **接続情報の確認**
   ```bash
   # 環境変数の確認
   echo $DATABASE_URL
   
   # 手動接続テスト
   psql "postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus"
   ```

3. **ポート競合の確認**
   ```bash
   # ポート使用状況確認
   lsof -i :5433
   netstat -an | grep 5433
   ```

#### Prismaエラー

1. **クライアント再生成**
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

2. **マイグレーション状態の確認**
   ```bash
   npx prisma migrate status
   npx prisma db push  # 強制同期（開発時のみ）
   ```

### 📊 データベーススキーマ

Card Nexusでは以下のテーブル構造を使用しています：

- **User** - ユーザー情報
- **Card** - カード情報（ポケモンカード等）
- **Listing** - 売買出品情報
- **Transaction** - 取引履歴
- **Message** - ユーザー間メッセージ
- **Review** - ユーザー評価・レビュー
- **Price** - カード価格履歴
- **Deck** - デッキ構築情報

詳細なスキーマは `prisma/schema.prisma` を参照してください。

## 📝 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Linting
npm run lint

# Prismaクライアント再生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate dev

# Prisma Studio（データベースビューア）
npx prisma studio
```

## 📚 詳細ドキュメント

- **[スキーマ同期システム](docs/schema-sync-system.md)** - 自動スキーマ検証・同期システム
- **[データベース同期状況](docs/database-sync-status.md)** - ローカル・本番DB同期レポート  
- **[Neonデータベース設定](docs/neon-database-setup.md)** - Neonデータベースの詳細な設定手順
- **[Neon環境変数設定](docs/neon-env-vars.md)** - Vercel用環境変数の設定方法
- **[Vercel環境変数設定](docs/vercel-env-setup.md)** - Vercel Dashboard設定手順
- **[データベース構築ガイド](docs/database-setup.md)** - PostgreSQL環境の詳細な構築手順
- **[クイックリファレンス](docs/quick-reference.md)** - 開発時によく使うコマンド集
- **[API仕様書](docs/api-specification.md)** - REST API エンドポイントの詳細
- **[開発計画](docs/development.md)** - プロジェクトの進捗とマイルストーン

## 🎨 コード品質

### ESLint + Prettier
コードスタイルの統一とエラー検出のため、ESLintとPrettierを使用しています。

### TypeScript
型安全性を保つため、strict modeを有効にしています。`any`型の使用は禁止です。

## 🔐 セキュリティ

- NextAuth.jsによる安全な認証
- CSRF攻撃対策
- XSS攻撃対策
- SQL インジェクション対策（Prisma ORM）
- パスワードハッシュ化（bcrypt）

## 🤝 開発方針

## 🗺️ 開発ロードマップ

### 📅 フェーズ1 (完了)
- [x] ユーザー登録・ログイン機能
- [x] ポケモンカード基本データベース  
- [x] シンプルな売買掲示板
- [x] ユーザープロフィール管理

### 📅 フェーズ2 (開発中)
- [ ] 出品詳細ページ (`/listings/[id]`)
- [ ] オファー・交渉システム
- [ ] 取引完了・評価機能
- [ ] メッセージング機能

### 📅 フェーズ3 (計画中)
- [ ] 高度な検索・フィルタ機能
- [ ] デッキ構築・共有機能
- [ ] 通知システム
- [ ] モバイルアプリ対応

### 📈 現在の実装進捗
**全体進捗**: 約 65% 完了

- **認証システム**: 100% ✅
- **カードデータベース**: 100% ✅  
- **売買機能**: 70% 🚧
- **ユーザー管理**: 100% ✅
- **評価システム**: 20% 📋
- **デッキ機能**: 0% 📋

### コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルドプロセス・補助ツール修正
```

## 📄 ライセンス

このプロジェクトは MIT ライセンス の下で公開されています。

## � Vercelデプロイ手順

### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2. Vercelにログイン

```bash
vercel login
```

### 3. プロジェクトをVercelにリンク

```bash
vercel --prod
```

### 4. 環境変数の設定

Vercel Dashboard で以下の環境変数を設定してください：

```env
# Neon Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"  
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

### 5. Neonデータベース設定

Card NexusではNeonデータベースを使用します：

1. **[Neon](https://neon.tech/)** にアクセスしアカウントを作成
2. 新しいプロジェクトを作成: `cardnexus-production`  
3. 接続文字列をコピー
4. Vercel環境変数の `DATABASE_URL` に設定
5. 詳細な手順は `docs/neon-database-setup.md` を参照

**その他のオプション**:
- **Supabase**: https://supabase.com/
- **PlanetScale**: https://planetscale.com/
- **Railway**: https://railway.app/

### 6. 自動デプロイ

GitHubにプッシュすると自動的にデプロイされます：

```bash
git add .
git commit -m "feat: vercel deployment setup"
git push origin main
```

### 7. ドメイン設定

Vercel Dashboard でカスタムドメインを設定できます。

## �📞 サポート

問題や質問がある場合は、[GitHub Issues](./issues) でお知らせください。

---

**Card Nexus** - あなたのカードゲームライフをより豊かに 🎮✨
