# Card Nexus API 仕様書

## 概要

Card Nexus のREST API エンドポイント一覧と使用方法を説明します。

## 認証

NextAuth.js セッションベース認証を使用しています。認証が必要なエンドポイントでは、有効なセッションが必要です。

## 📋 実装済み API エンドポイント

### 🔐 認証関連 (NextAuth.js)

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/auth/signin` | サインインページ | - |
| POST | `/api/auth/signin` | サインイン処理 | - |
| GET | `/api/auth/signout` | サインアウト処理 | - |
| GET | `/api/auth/session` | セッション情報取得 | - |

### 🃏 カード関連

| Method | Endpoint | 説明 | 認証 | 実装状況 |
|--------|----------|------|------|----------|
| GET | `/api/cards` | カード一覧取得・検索 | - | ✅ |
| GET | `/api/cards/[id]` | カード詳細取得 | - | ✅ |

**GET /api/cards**
- 検索・フィルター・ソート・ページネーション対応
- クエリ: `search`, `gameTitle`, `rarity`, `expansion`, `sortBy`, `page`, `limit`

**GET /api/cards/[id]**  
- カード詳細情報・価格履歴・統計情報を返却

### 📋 出品関連

| Method | Endpoint | 説明 | 認証 | 実装状況 |
|--------|----------|------|------|----------|
| GET | `/api/listings` | 出品一覧取得・検索 | - | ✅ |
| POST | `/api/listings` | 出品新規作成 | Required | ✅ |
| GET | `/api/listings/[id]` | 出品詳細取得 | - | 📋 |
| PUT | `/api/listings/[id]` | 出品更新 | Required | 📋 |
| DELETE | `/api/listings/[id]` | 出品削除 | Required | 📋 |

**GET /api/listings**
- 売買・交換出品の検索・フィルター・ページネーション対応
- クエリ: `search`, `type`, `cardId`, `userId`, `page`, `limit`

**POST /api/listings** 
- 売る・買う・交換の3タイプ対応
- バリデーション: カードID、価格、状態、説明文
| GET | `/api/auth/session` | セッション取得 | - |

### 👤 ユーザー管理

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/users/me` | 自分のプロフィール取得 | Required |
| PUT | `/api/users/me` | プロフィール更新 | Required |
| GET | `/api/users/{userId}` | 他ユーザープロフィール | - |
| GET | `/api/users/{userId}/reviews` | ユーザーの評価一覧 | - |

### 🃏 カード管理

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/cards` | カード検索・一覧 | - |
| GET | `/api/cards/{cardId}` | カード詳細取得 | - |
| GET | `/api/cards/{cardId}/prices` | カード価格履歴 | - |
| POST | `/api/cards` | カード情報作成 | Required |

### 📝 出品管理

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/listings` | 出品一覧・検索 | - |
| POST | `/api/listings` | 新規出品作成 | Required |
| GET | `/api/listings/{listingId}` | 出品詳細取得 | - |
| PUT | `/api/listings/{listingId}` | 出品情報更新 | Required |
| DELETE | `/api/listings/{listingId}` | 出品削除 | Required |

### 💰 取引管理

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| POST | `/api/transactions` | 取引開始 | Required |
| GET | `/api/transactions/{transactionId}` | 取引詳細 | Required |
| PUT | `/api/transactions/{transactionId}` | 取引ステータス更新 | Required |
| GET | `/api/users/me/transactions` | 自分の取引履歴 | Required |

### 💬 メッセージ

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/messages` | メッセージ一覧 | Required |
| POST | `/api/messages` | メッセージ送信 | Required |
| GET | `/api/messages/conversations/{userId}` | 特定ユーザーとの会話 | Required |
| PUT | `/api/messages/{messageId}/read` | メッセージ既読 | Required |

### ⭐ 評価システム

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| POST | `/api/reviews` | 評価投稿 | Required |
| GET | `/api/reviews/{reviewId}` | 評価詳細 | - |
| PUT | `/api/reviews/{reviewId}` | 評価更新 | Required |

### 🎴 デッキ管理

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/decks` | デッキ一覧・検索 | - |
| POST | `/api/decks` | デッキ作成 | Required |
| GET | `/api/decks/{deckId}` | デッキ詳細 | - |
| PUT | `/api/decks/{deckId}` | デッキ更新 | Required |
| DELETE | `/api/decks/{deckId}` | デッキ削除 | Required |

## 📊 データ型定義

### User Response
```typescript
{
  id: string
  username: string
  email: string
  profileImageUrl?: string
  bio?: string
  rating: number
  ratingCount: number
  createdAt: string
}
```

### Card Response
```typescript
{
  id: string
  name: string
  gameTitle: string
  imageUrl?: string
  rarity?: string
  effectText?: string
  cardNumber?: string
  expansion?: string
  prices: Price[]
}
```

### Listing Response
```typescript
{
  id: string
  user: User
  card: Card
  listingType: "SELL" | "BUY" | "TRADE"
  price?: number
  condition?: string
  description?: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED"
  createdAt: string
}
```

### Transaction Response
```typescript
{
  id: string
  listing: Listing
  buyer: User
  seller: User
  price: number
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  createdAt: string
  completedAt?: string
}
```

## 🔍 クエリパラメータ仕様

### カード検索 (`/api/cards`)
```
?name=ピカチュウ         # カード名での検索
&gameTitle=ポケモンカード # ゲームタイトル
&rarity=RRR             # レアリティ
&expansion=拡張パック名   # 拡張パック
&page=1                 # ページ番号
&limit=20               # 1ページあたりの件数
&sort=name              # ソート項目 (name, rarity, createdAt)
&order=asc              # ソート順 (asc, desc)
```

### 出品検索 (`/api/listings`)
```
?cardName=ピカチュウ     # カード名
&listingType=SELL       # 取引種別
&minPrice=1000          # 最低価格
&maxPrice=5000          # 最高価格
&condition=美品         # カード状態
&gameTitle=ポケモンカード # ゲームタイトル
&page=1                 # ページ番号
&limit=20               # 1ページあたりの件数
```

## ❌ エラーレスポンス

### 標準エラー形式
```typescript
{
  error: {
    code: string        # エラーコード
    message: string     # エラーメッセージ
    details?: any       # 追加詳細情報
  }
}
```

### 主要エラーコード

| コード | 説明 | HTTPステータス |
|--------|------|-------------|
| `UNAUTHORIZED` | 認証が必要 | 401 |
| `FORBIDDEN` | アクセス権限なし | 403 |
| `NOT_FOUND` | リソースが見つからない | 404 |
| `VALIDATION_ERROR` | 入力値エラー | 400 |
| `DUPLICATE_ERROR` | 重複データ | 409 |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 | 429 |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー | 500 |

## 🔐 認証・認可

### JWT トークン
- **アクセストークン**: 15分間有効
- **リフレッシュトークン**: 7日間有効
- ヘッダー: `Authorization: Bearer {token}`

### 認証が必要なエンドポイント
- ユーザー情報の更新
- 出品の作成・編集・削除
- 取引の開始・更新
- メッセージの送受信
- 評価の投稿

## 📈 レート制限

| エンドポイント種別 | 制限 | 期間 |
|------------------|------|------|
| 認証関連 | 5回 | 1分 |
| 検索API | 100回 | 1分 |
| 書き込み系API | 30回 | 1分 |
| メッセージ送信 | 10回 | 1分 |

---

**Card Nexus API v1.0** - 更新日: 2025年10月14日