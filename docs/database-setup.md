# Card Nexus ローカルDB構築ガイド 🗄️

## 概要

Card Nexusの開発環境でPostgreSQLデータベースを構築するための詳細手順書です。

## 🐳 Docker環境でのセットアップ（推奨）

### Step 1: 前提条件の確認

```bash
# Docker & Docker Composeの確認
docker --version
# Docker version 20.10.0 以上

docker-compose --version  
# docker-compose version 1.29.0 以上
```

### Step 2: プロジェクトのクローンと移動

```bash
git clone https://github.com/fujiwara-akira-git/cardnexux.git
cd cardnexus
```

### Step 3: Docker Composeの設定確認

`docker-compose.yml` の内容：

```yaml
version: '3.8'

services:
  cardnexus-db:
    image: postgres:15
    container_name: cardnexus-postgres
    environment:
      POSTGRES_DB: cardnexus
      POSTGRES_USER: cardnexus_user
      POSTGRES_PASSWORD: cardnexus_password
    ports:
      - "5433:5432"  # 既存PostgreSQLと競合回避
    volumes:
      - cardnexus_db_data:/var/lib/postgresql/data
    networks:
      - cardnexus_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cardnexus_user -d cardnexus"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  cardnexus_db_data:

networks:
  cardnexus_network:
    driver: bridge
```

### Step 4: PostgreSQLコンテナの起動

```bash
# バックグラウンドでコンテナ起動
docker-compose up -d

# 起動状態の確認
docker ps | grep cardnexus-postgres

# ヘルスチェック状態の確認
docker-compose ps
```

**期待される出力:**
```
    Name                  Command              State                    Ports                  
---------------------------------------------------------------------------------------------
cardnexus-postgres   docker-entrypoint.s...   Up (healthy)   0.0.0.0:5433->5432/tcp,:::5433->5432/tcp
```

### Step 5: データベース接続テスト

```bash
# PostgreSQLクライアントでの接続確認
docker exec -it cardnexus-postgres psql -U cardnexus_user -d cardnexus

# 接続成功時のプロンプト
cardnexus=# 

# データベース一覧確認
\l

# 接続終了
\q
```

### Step 6: 環境変数の設定

`.env.local` ファイルを作成：

```env
# Database Configuration
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5433/cardnexus?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="dev-secret-change-in-production-12345"

# OAuth Providers（開発時は空でOK）
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

### Step 7: Node.js依存関係のインストール

```bash
# パッケージインストール
npm install

# Prismaクライアント生成
npx prisma generate
```

### Step 8: データベーススキーマの作成

```bash
# マイグレーション実行（初回）
npx prisma migrate dev --name init

# 成功メッセージ例：
# ✔ Generated Prisma Client to ./node_modules/@prisma/client
# Your database is now in sync with your schema.
```

### Step 9: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3001` にアクセスして動作確認

## 🔧 ローカルPostgreSQL環境でのセットアップ

### macOS (Homebrew)

```bash
# PostgreSQL 15のインストール
brew install postgresql@15

# サービス開始
brew services start postgresql@15

# パスの確認
which psql
# /opt/homebrew/bin/psql であることを確認

# PostgreSQLに接続
psql postgres
```

### Ubuntu/Debian

```bash
# PostgreSQL 15のインストール
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/download/linux/ubuntu/ | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-15 postgresql-client-15

# PostgreSQLサービス開始
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows

1. [PostgreSQL公式サイト](https://www.postgresql.org/download/windows/)からインストーラーをダウンロード
2. インストーラーを実行し、PostgreSQL 15をインストール
3. インストール時に設定したパスワードを記録
4. pgAdmin 4も同時にインストールされることを確認

### データベースとユーザーの作成

```sql
-- PostgreSQLに管理者でログイン
sudo -u postgres psql  # Linux
psql postgres           # macOS

-- Card Nexus用データベースとユーザーの作成
CREATE DATABASE cardnexus;
CREATE USER cardnexus_user WITH PASSWORD 'cardnexus_password';

-- 権限付与
GRANT ALL PRIVILEGES ON DATABASE cardnexus TO cardnexus_user;
GRANT CREATE ON SCHEMA public TO cardnexus_user;

-- 接続テスト
\c cardnexus cardnexus_user
SELECT current_user, current_database();

-- 終了
\q
```

### 環境変数の設定（ローカルPostgreSQL用）

`.env.local` ファイル：

```env
# ローカルPostgreSQL用（ポート5432）
DATABASE_URL="postgresql://cardnexus_user:cardnexus_password@localhost:5432/cardnexus?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="dev-secret-change-in-production-12345"
```

## 🛠 データベース管理とメンテナンス

### Prisma Studio（GUI管理ツール）

```bash
# Prisma Studio起動
npx prisma studio

# ブラウザで http://localhost:5555 にアクセス
```

**Prisma Studioでできること:**
- テーブルデータの閲覧・編集
- リレーションの可視化
- SQLクエリの実行
- データのインポート・エクスポート

### よく使うPrismaコマンド

```bash
# スキーマの状態確認
npx prisma migrate status

# 新しいマイグレーション作成
npx prisma migrate dev --name add_new_feature

# データベースリセット（開発時のみ）
npx prisma migrate reset

# スキーマとDBを強制同期（開発時のみ）
npx prisma db push

# 既存DBからスキーマを逆生成
npx prisma db pull
```

### Docker管理コマンド

```bash
# コンテナ状態確認
docker-compose ps

# ログ確認
docker-compose logs cardnexus-db

# コンテナ再起動
docker-compose restart cardnexus-db

# コンテナ停止
docker-compose down

# データも含めて完全削除（注意！）
docker-compose down -v
docker volume rm cardnexus_cardnexus_db_data
```

## 🔍 トラブルシューティング

### 接続エラー「Connection refused」

**原因と対策:**

1. **Dockerコンテナが起動していない**
   ```bash
   docker-compose up -d
   docker ps | grep cardnexus
   ```

2. **ポート競合**
   ```bash
   # ポート使用状況確認
   lsof -i :5433
   netstat -an | grep 5433
   
   # 他のサービスが使用している場合、docker-compose.ymlのポートを変更
   ```

3. **環境変数の設定ミス**
   ```bash
   # 環境変数確認
   cat .env.local | grep DATABASE_URL
   ```

### マイグレーションエラー

1. **Prismaクライアント再生成**
   ```bash
   rm -rf node_modules/.prisma
   rm -rf node_modules/@prisma
   npm install
   npx prisma generate
   ```

2. **マイグレーション状態確認**
   ```bash
   npx prisma migrate status
   
   # 不整合がある場合
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

### パーミッションエラー

```sql
-- PostgreSQLに管理者でログイン
sudo -u postgres psql

-- 権限確認と付与
\c cardnexus
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cardnexus_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cardnexus_user;
GRANT CREATE ON SCHEMA public TO cardnexus_user;
```

## 📊 データベーススキーマ詳細

### 主要テーブル構造

1. **User** - ユーザー情報
   - id (CUID)
   - username (一意)
   - email (一意)
   - passwordHash
   - profileImageUrl
   - rating (評価平均)

2. **Card** - カード情報
   - id (CUID)
   - name (カード名)
   - cardId (公式ID)
   - setName (セット名)
   - rarity (レアリティ)
   - type (タイプ)

3. **Listing** - 出品情報
   - id (CUID)
   - userId (出品者)
   - cardId (カード)
   - price (価格)
   - condition (状態)
   - status (出品状況)

### リレーション図

```
User ----< Listing >---- Card
 |          |
 |          |
 +----< Transaction >----+
 |          |
 |          |
 +----< Message >-------+
 |          |
 |          |
 +----< Review >--------+
```

## 🚀 本番環境へのデプロイ

### 環境変数（本番用）

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="super-secure-secret-key-minimum-32-characters"
```

### マイグレーション（本番）

```bash
# 本番環境でのマイグレーション実行
npx prisma migrate deploy

# 本番環境ではresetやdevコマンドは使用禁止
```

---

**最終更新**: 2025年10月14日  
**対象バージョン**: Card Nexus v1.0.0