
import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Image from "next/image";

// フィールド名の日本語マッピング
const fieldLabels: Record<string, string> = {
  id: 'ID',
  name: '名前',
  nameJa: '名前（日本語）',
  gameTitle: 'ゲームタイトル',
  cardNumber: 'カード番号',
  expansion: '拡張パック',
  expansionJa: '拡張パック（日本語）',
  rarity: 'レアリティ',
  effectText: '効果テキスト',
  effectTextJa: '効果テキスト（日本語）',
  imageUrl: '画像URL',
  regulationMark: 'レギュレーションマーク',
  cardType: 'カードタイプ',
  cardTypeJa: 'カードタイプ（日本語）',
  hp: 'HP',
  types: 'タイプ',
  typesJa: 'タイプ（日本語）',
  evolveFrom: '進化元',
  evolveFromJa: '進化元（日本語）',
  artist: 'イラストレーター',
  subtypes: 'サブタイプ',
  subtypesJa: 'サブタイプ（日本語）',
  releaseDate: '発売日',
  createdAt: '作成日時',
  abilities: '特性',
  attacks: 'ワザ',
  weaknesses: '弱点',
  resistances: '抵抗力',
  retreatCost: 'にげるコスト',
  legalities: '合法性',
  rules: 'ルール',
  nationalPokedexNumbers: '全国図鑑番号',
  priceStats: '価格統計',
  priceHistory: '価格履歴',
  activeListings: 'アクティブ出品',
  // priceStatsのサブフィールド
  latest: '最新価格',
  average: '平均価格',
  min: '最低価格',
  max: '最高価格',
  // 共通フィールド
  price: '価格',
  source: 'ソース',
  condition: '状態',
  recordedAt: '記録日時',
  type: 'タイプ',
  value: '値',
  cost: 'コスト',
  damage: 'ダメージ',
  text: 'テキスト',
  quantity: '数量',
  description: '説明',
  user: 'ユーザー',
  username: 'ユーザー名',
  rating: '評価',
  reviewCount: 'レビュー数',
  createdAt: '作成日時',
  expiresAt: '有効期限',
};

// JSONデータをテーブル形式でレンダリングする関数
function renderJsonTable(data: Record<string, unknown>): React.JSX.Element {
  const renderArrayAsTable = (key: string, array: unknown[], label: string): React.ReactNode => {
    if (!Array.isArray(array) || array.length === 0) return <></>;

    // 最初のアイテムから列を決定
    const firstItem = array[0];
    if (typeof firstItem !== 'object' || firstItem === null) return <></>;

    const columns = Object.keys(firstItem as Record<string, unknown>);

    return (
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">{label}</h4>
        <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-2 text-left text-gray-700 font-medium border-b">
                  {fieldLabels[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {array.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map(col => {
                  const value = (item as Record<string, unknown>)[col];
                  let displayValue = '';
                  if (value === null || value === undefined) {
                    displayValue = '';
                  } else if (typeof value === 'boolean') {
                    displayValue = value ? 'はい' : 'いいえ';
                  } else if (typeof value === 'string' || typeof value === 'number') {
                    displayValue = String(value);
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else if (typeof value === 'object') {
                    const subEntries = Object.entries(value as Record<string, unknown>);
                    displayValue = subEntries.map(([k, v]) => `${fieldLabels[k] || k}: ${String(v)}`).join(', ');
                  }
                  return (
                    <td key={col} className="px-4 py-2 text-gray-900">
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const flattenData = (obj: Record<string, unknown>, prefix: string = ''): Array<{key: string, value: string | React.ReactNode, label: string}> => {
    const result: Array<{key: string, value: unknown, label: string}> = [];

    Object.entries(obj).forEach(([key, value]) => {
      // 除外するフィールド
      const excludedFields = ['id', 'gameTitle', 'rarity', 'hp', 'types', 'regulationMark', 'artist'];
      if (excludedFields.includes(key)) {
        return;
      }

      const fullKey = prefix ? `${prefix}.${key}` : key;
      const label = fieldLabels[key] || key;

      // 空の値やnull/undefinedは表示しない
      if (value === null || value === undefined) {
        return;
      }

      if (typeof value === 'boolean') {
        result.push({ key: fullKey, value: value ? 'はい' : 'いいえ', label });
      } else if (typeof value === 'string' || typeof value === 'number') {
        if (key === 'imageUrl') {
          result.push({ key: fullKey, value: <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">画像リンク</a>, label });
        } else {
          result.push({ key: fullKey, value: String(value), label });
        }
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          return; // 空の配列は表示しない
        } else if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
          // シンプルな配列（文字列や数字のみ）
          result.push({ key: fullKey, value: value.join(', '), label });
        } else {
          // 配列は特別に処理しない（renderJsonTableで処理）
          return;
        }
      } else if (typeof value === 'object') {
        const nestedObj = value as Record<string, unknown>;
        const entries = Object.entries(nestedObj);
        if (entries.length === 0) {
          return; // 空のオブジェクトは表示しない
        } else if (key === 'priceStats') {
          // priceStats の場合はサブフィールドを個別に表示
          entries.forEach(([subKey, subValue]) => {
            const subFullKey = `${fullKey}.${subKey}`;
            const subLabel = fieldLabels[subKey] || subKey;
            if (subValue !== null && subValue !== undefined) {
              if (typeof subValue === 'boolean') {
                result.push({ key: subFullKey, value: subValue ? 'はい' : 'いいえ', label: `${label} - ${subLabel}` });
              } else if (typeof subValue === 'string' || typeof subValue === 'number') {
                result.push({ key: subFullKey, value: String(subValue), label: `${label} - ${subLabel}` });
              } else if (Array.isArray(subValue)) {
                if (subValue.length > 0) {
                  result.push({ key: subFullKey, value: subValue.join(', '), label: `${label} - ${subLabel}` });
                }
              } else if (typeof subValue === 'object') {
                // さらにネストされた場合は簡略化
                const subEntries = Object.entries(subValue as Record<string, unknown>);
                if (subEntries.length > 0) {
                  const summary = subEntries.map(([k, v]) => `${fieldLabels[k] || k}: ${String(v)}`).join(', ');
                  result.push({ key: subFullKey, value: summary, label: `${label} - ${subLabel}` });
                }
              }
            }
          });
        } else {
          // 他のオブジェクトの場合、主要フィールドのみを表示
          const importantFields = ['name', 'price', 'type', 'value', 'username'];
          const importantData = entries.filter(([k]) => importantFields.includes(k));
          if (importantData.length > 0) {
            const summary = importantData.map(([k, v]) => `${fieldLabels[k] || k}: ${String(v)}`).join(', ');
            result.push({ key: fullKey, value: summary, label });
          } else {
            result.push({ key: fullKey, value: `${entries.length}個のフィールド`, label });
          }
        }
      } else {
        result.push({ key: fullKey, value: String(value), label });
      }
    });

    return result;
  };

  const flatData = flattenData(data);

  // データを2列に分割
  const midIndex = Math.ceil(flatData.length / 2);
  const leftColumn = flatData.slice(0, midIndex);
  const rightColumn = flatData.slice(midIndex);

  return (
    <div>
      {/* 配列データをテーブル形式で表示 */}
      {data.attacks && Array.isArray(data.attacks) ? renderArrayAsTable('attacks', data.attacks, 'ワザ') : null}
      {data.weaknesses && Array.isArray(data.weaknesses) ? renderArrayAsTable('weaknesses', data.weaknesses, '弱点') : null}

      {/* 他のデータを2列テーブルで表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左列 */}
        <div>
          <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">項目名</th>
                <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">値</th>
              </tr>
            </thead>
            <tbody>
              {leftColumn.map(({ key, value, label }) => (
                <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-700 border-r border-gray-200">
                    {label}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右列 */}
        <div>
          <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">項目名</th>
                <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">値</th>
              </tr>
            </thead>
            <tbody>
              {rightColumn.map(({ key, value, label }) => (
                <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-700 border-r border-gray-200">
                    {label}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/cards/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-600">
        <Header />
        <div>カード情報の取得に失敗しました</div>
        <Footer />
      </div>
    );
  }
  const { data: card } = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">カード詳細情報</h1>

          {/* レイアウト：左側に画像と基本情報、右側に全データ表 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側：画像と基本情報 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 画像 */}
              <div className="flex justify-center">
                {card.imageUrl ? (
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    width={320}
                    height={448}
                    className="rounded-lg border bg-white"
                    style={{ objectFit: "contain" }}
                    priority
                  />
                ) : (
                  <div className="w-80 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* 基本情報テーブル */}
              <div>
                <h3 className="text-lg font-medium mb-3">基本情報</h3>
                <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                  <tbody>
                    <tr>
                      <th className="text-left p-2 w-32 text-gray-600 bg-gray-50">ゲームタイトル</th>
                      <td className="p-2">{card.gameTitle || '不明'}</td>
                    </tr>
                    {card.expansion && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">拡張パック</th>
                        <td className="p-2">{card.expansion}</td>
                      </tr>
                    )}
                    {card.cardNumber && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">カードNo.</th>
                        <td className="p-2">{card.cardNumber}</td>
                      </tr>
                    )}
                    {card.hp && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">HP</th>
                        <td className="p-2">{card.hp}</td>
                      </tr>
                    )}
                    {card.types && Array.isArray(card.types) && card.types.length > 0 && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">タイプ</th>
                        <td className="p-2">{card.types.join(', ')}</td>
                      </tr>
                    )}
                    {card.regulationMark && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">レギュレーションマーク</th>
                        <td className="p-2">{card.regulationMark}</td>
                      </tr>
                    )}
                    {card.rarity && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">レアリティ</th>
                        <td className="p-2">{card.rarity}</td>
                      </tr>
                    )}
                    {card.artist && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">イラスト</th>
                        <td className="p-2">{card.artist}</td>
                      </tr>
                    )}
                    {card.releaseDate && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">発売日</th>
                        <td className="p-2">{card.releaseDate}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 右側：全データ表 */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {renderJsonTable(card)}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
