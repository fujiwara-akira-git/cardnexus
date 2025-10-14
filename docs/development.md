# Card Nexus - 開発ドキュメント

## 🔗 プロジェクトリンク

- **GitHub Repository**: https://github.com/fujiwara-akira-git/cardnexux
- **ローカル開発環境**: http://localhost:3001

## 📅 プロジェクト進捗

### ✅ Phase 0: プロジェクト基盤構築 (完了)

**実装済み項目:**
- [x] Next.js 14 + TypeScript + Tailwind CSS セットアップ
- [x] Prisma ORM + PostgreSQL データベース設計
- [x] NextAuth.js 認証システム基盤
- [x] プロジェクト構造とディレクトリ設計
- [x] VS Code 開発環境とエクステンション
- [x] GitHub リポジトリ連携
- [x] 開発ドキュメントとガイドライン

**技術仕様:**
- フロントエンド: Next.js 14 (App Router)
- 言語: TypeScript (strict mode)
- スタイリング: Tailwind CSS
- データベース: PostgreSQL + Prisma ORM
- 認証: NextAuth.js (Google, Discord, Email/Password)
- 開発ツール: ESLint, Prettier

## 🗃 データベース設計

### Core Tables

| テーブル名 | 説明 | 主要フィールド |
|-----------|------|-------------|
| `User` | ユーザー情報 | id, username, email, rating |
| `Card` | カード基本情報 | id, name, gameTitle, rarity |
| `Listing` | 売買掲示板 | id, type(SELL/BUY/TRADE), price |
| `Transaction` | 取引履歴 | id, buyerId, sellerId, status |
| `Message` | メッセージ | id, senderId, receiverId, content |
| `Review` | 評価システム | id, rating, comment |
| `Price` | 価格履歴 | id, cardId, price, source |
| `Deck` | デッキレシピ | id, name, gameTitle, isPublic |

## 🎯 MVP フェーズ1 計画 (次の3ヶ月)

### Week 1-2: UI基盤とナビゲーション
- [ ] ホームページデザイン実装
- [ ] 共通レイアウトコンポーネント
- [ ] ナビゲーションバー
- [ ] フッター
- [ ] レスポンシブデザイン対応

### Week 3-6: 認証システム
- [ ] サインアップページ
- [ ] サインインページ
- [ ] プロフィールページ
- [ ] ユーザー設定機能
- [ ] NextAuth.js プロバイダー設定

### Week 7-10: カードデータベース
- [ ] カード検索機能
- [ ] カード詳細ページ
- [ ] カード画像表示システム
- [ ] フィルタリング機能
- [ ] ポケモンカードデータインポート

### Week 11-12: 売買掲示板 MVP
- [ ] 出品機能 (基本)
- [ ] 出品一覧ページ
- [ ] 出品詳細ページ
- [ ] 簡易検索機能
- [ ] メッセージ機能 (基本)

## 🚀 開発フロー

### ブランチ戦略
```
main (本番) ← develop (統合) ← feature/xxx (機能開発)
```

### 推奨開発フロー
1. `git checkout -b feature/機能名` で機能ブランチ作成
2. 機能開発・テスト
3. `git push origin feature/機能名`
4. GitHub上でPull Request作成
5. コードレビュー後、developブランチにマージ

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

## 🛠 開発コマンド一覧

```bash
# 開発サーバー起動
npm run dev

# データベースマイグレーション
npx prisma migrate dev

# Prisma Studio (DB管理)
npx prisma studio

# Prismaクライアント再生成
npx prisma generate

# コード品質チェック
npm run lint

# ビルド
npm run build

# プロダクションサーバー
npm start
```

## 📊 マイルストーン

### マイルストーン 1: ユーザー管理 (Week 1-6)
- ユーザー登録・ログイン・プロフィール機能の完成

### マイルストーン 2: カードDB (Week 7-10)
- ポケモンカードデータベースと検索機能の完成

### マイルストーン 3: 売買掲示板 (Week 11-12)
- 基本的な出品・閲覧・メッセージ機能の完成

### マイルストーン 4: MVP完成 (Week 13-14)
- 統合テスト・バグ修正・デプロイ準備

## 📞 Contact & Links

- **Repository**: https://github.com/fujiwara-akira-git/cardnexux
- **Issues**: https://github.com/fujiwara-akira-git/cardnexux/issues
- **Project Board**: https://github.com/fujiwara-akira-git/cardnexux/projects

---

最終更新: 2025年10月14日