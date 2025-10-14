-- サンプル出品データ
INSERT INTO "listings" (
  id,
  "userId",
  "cardId",
  "listingType",
  price,
  condition,
  description,
  status,
  "createdAt",
  "updatedAt"
) VALUES 
-- ピカチュウVMAX 出品
(
  'listing-1',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfak0000nswownwyfyp7',
  'SELL',
  1500,
  'NM',
  '美品です。プレイ用からコレクション用まで幅広くお使いいただけます。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- リザードンVSTAR 求購
(
  'listing-2',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfb0000wnswoi9zuhuj9',
  'BUY',
  8000,
  'NM',
  'PSA9以上の状態で探しています。コレクション目的です。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- フシギバナVMAX 交換
(
  'listing-3',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfb6001snswo334sgwue',
  'TRADE',
  NULL,
  'LP',
  'カメックスVMAXと交換希望です。同レアリティで状態の良いものをお願いします。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- カメックスVMAX 出品
(
  'listing-4',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfbc002onswokievsxrr',
  'SELL',
  800,
  'NM',
  '新パック開封品です。即スリーブに入れて保管していました。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- イーブイVMAX 出品
(
  'listing-5',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfbw005cnswosdb3blug',
  'SELL',
  2500,
  'NM',
  'プロモカードです。未使用品で状態は非常に良好です。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- ゲンガーVMAX 求購
(
  'listing-6',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfbi003knswov3xhznrq',
  'BUY',
  15000,
  'NM',
  'コレクション用で探しています。多少の価格交渉は可能です。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- ルカリオVSTAR 交換
(
  'listing-7',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfbp004gnswoofh035fb',
  'TRADE',
  NULL,
  'NM',
  '他の伝説ポケモンカードと交換希望。同価値帯であれば検討します。',
  'ACTIVE',
  NOW(),
  NOW()
),
-- アルセウスVSTAR 出品
(
  'listing-8',
  'cmgqk117z0000nso5q5brltcu',
  'cmgqiqfc10068nswoirqev380',
  'SELL',
  12000,
  'NM',
  '人気の高いアルセウスです。投資目的の方にもおすすめです。',
  'ACTIVE',
  NOW(),
  NOW()
);