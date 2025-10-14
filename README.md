# Card Nexus 🃏

カードゲームプレイヤーのための情報交換・取引プラットフォーム

「すべてのカードゲームプレイヤーが集う、情報と交流の拠点（ハブ）」をコンセプトとした、Next.js製のフルスタックWebアプリケーションです。

## 🎯 プロジェクト概要

Card Nexusは、カードゲーム愛好者が以下の活動を一つのプラットフォームで行えるサービスです：

- 📚 **カードデータベース**: ポケモンカード等の詳細情報検索
- 💰 **価格トラッカー**: リアルタイム相場情報の確認
- 🛒 **売買掲示板**: ユーザー間でのカード売買・交換
- ⭐ **評価システム**: 安全な取引のための信頼性評価
- 🎴 **デッキ共有**: オリジナルデッキレシピの投稿・閲覧

## 🛠 技術スタック

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
- PostgreSQL データベース

### インストール手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd cardnexus
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   
   `.env`ファイルを編集し、データベース接続情報を設定:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **データベースのセットアップ**
   ```bash
   # Prismaクライアント生成
   npx prisma generate
   
   # データベースマイグレーション
   npx prisma migrate dev --name init
   ```

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

   ブラウザで `http://localhost:3000` にアクセス

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

### MVP フェーズ1 (3ヶ月目標)
1. ユーザー登録・ログイン機能
2. ポケモンカード基本データベース
3. シンプルな売買掲示板
4. 基本的な評価システム

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

## 📞 サポート

問題や質問がある場合は、[GitHub Issues](./issues) でお知らせください。

---

**Card Nexus** - あなたのカードゲームライフをより豊かに 🎮✨
