import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Image from "next/image";
import Link from "next/link";

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
  flavorText: 'フレーバーテキスト',
  setId: 'セットID',
  imageUrl: '画像URL',
  regulationMark: 'レギュレーションマーク',
  cardType: 'カードタイプ',
  cardTypeJa: 'カードタイプ（日本語）',
  supertype: 'スーパータイプ',
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
  legalities: 'リーガリティ',
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
  expiresAt: '有効期限',
};

// JSONデータをテーブル形式でレンダリングする関数
function renderJsonTable(data: Record<string, unknown>): React.JSX.Element {
  const renderArrayAsTable = (key: string, array: unknown[], label: string): React.ReactNode => {
    if (!Array.isArray(array)) return null;

    if (array.length === 0) {
      return (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">{label}</h4>
          <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
            <tbody>
              <tr>
                <td className="px-4 py-2 text-gray-500 text-center">
                  なし
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // 最初のアイテムから列を決定
    const firstItem = array[0];
    if (typeof firstItem !== 'object' || firstItem === null) return null;

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

  const flattenData = (obj: Record<string, unknown>, prefix: string = ''): Array<{key: string, value: React.ReactNode, label: string}> => {
    const result: Array<{key: string, value: React.ReactNode, label: string}> = [];

    // 優先的に処理するフィールド（弱点の直下に配置）
    const priorityFields: string[] = [];

    // 優先フィールドを最初に処理
    priorityFields.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
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
      }
    });

    // 残りのフィールドを処理
    Object.entries(obj).forEach(([key, value]) => {
      // 除外するフィールドまたは既に処理した優先フィールドはスキップ
      const excludedFields = ['id', 'gameTitle', 'rarity', 'hp', 'types', 'regulationMark', 'artist', 'name', 'subtypes', 'cardNumber', 'expansion', 'effectText', 'effectTextJa', 'cardType', 'cardTypeJa', 'evolveFrom', 'evolveFromJa', 'nationalPokedexNumbers', 'legalities', 'abilities', 'flavorText', 'apiId', 'setId'];
      if (excludedFields.includes(key) || priorityFields.includes(key)) {
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

  // retreatCost, rulesを除外して一番下に残らないように
  const bottomFields = ['imageUrl', 'createdAt', 'retreatCost', 'rules'];
  const bottomData = flatData.filter(item => bottomFields.includes(item.key.split('.').pop() || ''));
  const otherData = flatData.filter(item => !bottomFields.includes(item.key.split('.').pop() || ''));

  const sortedFlatData = [...otherData, ...bottomData.filter(item => !['retreatCost', 'rules'].includes(item.key.split('.').pop() || ''))];

  return (
    <div>
      {/* 特性 */}
      {(() => {
        const abilities = Array.isArray(data.abilities) ? data.abilities : [];
        return renderArrayAsTable('abilities', abilities, '特性');
      })()}
      {/* ワザ */}
      {(() => {
        const attacks = Array.isArray(data.attacks) ? data.attacks : [];
        return renderArrayAsTable('attacks', attacks, 'ワザ');
      })()}
      {/* 弱点 */}
      {(() => {
        const weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];
        return renderArrayAsTable('weaknesses', weaknesses, '弱点');
      })()}
      {/* 効果テキスト */}
      {(() => {
        const effectText = data.effectText || data.effectTextJa;
        const hasEffectText = effectText && typeof effectText === 'string' && effectText.trim();
        return (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">効果</h4>
            <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-gray-900 whitespace-pre-wrap">
                    {hasEffectText ? effectText : <span className="text-gray-500">なし</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      {/* 抵抗力 */}
      {(() => {
        const resistances = Array.isArray(data.resistances) ? data.resistances : [];
        return renderArrayAsTable('resistances', resistances, '抵抗力');
      })()}
      {/* flavor text */}
      {(() => {
        console.log('flavorText data:', data.flavorText);
        const flavorText = data.flavorText && typeof data.flavorText === 'string' && data.flavorText.trim() ? data.flavorText : null;
        return (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">フレーバーテキスト</h4>
            <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-gray-900 whitespace-pre-wrap">
                    {flavorText || <span className="text-gray-500">なし</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}
      {/* リーガリティ */}
      {(() => {
        console.log('legalities data:', data.legalities);
        if (data.legalities && (Array.isArray(data.legalities) || typeof data.legalities === 'object')) {
          if (Array.isArray(data.legalities)) {
            return renderArrayAsTable('legalities', data.legalities, 'リーガリティ');
          } else {
            // オブジェクトの場合、キーと値を表示
            const entries = Object.entries(data.legalities as Record<string, unknown>);
            if (entries.length > 0) {
              return (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">リーガリティ</h4>
                  <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                    <tbody>
                      {entries.map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-700 border-r border-gray-200">
                            {fieldLabels[key] || key}
                          </td>
                          <td className="px-4 py-2 text-gray-900">
                            {String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            } else {
              return (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">リーガリティ</h4>
                  <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 text-gray-500 text-center">なし</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            }
          }
        } else {
          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">リーガリティ</h4>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <tbody>
                  <tr>
                    <td className="px-4 py-2 text-gray-500 text-center">なし</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      })()}
      {/* 逃げるコスト */}
      {(() => {
        let retreatArr: string[] = [];
        if (Array.isArray(data.retreatCost)) {
          retreatArr = data.retreatCost as string[];
        } else if (typeof data.retreatCost === 'string' && data.retreatCost) {
          retreatArr = data.retreatCost.split(',').map(v => v.trim());
        }
        if (retreatArr.length > 0) {
          // テーブルの1行に各コストを列として表示
          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">にげるコスト</h4>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <thead className="bg-gray-50">
                  <tr>
                    {retreatArr.map((_, idx) => (
                      <th key={idx} className="px-4 py-2 text-left text-gray-700 font-medium border-b">コスト{idx+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {retreatArr.map((cost, idx) => (
                      <td key={idx} className="px-4 py-2 text-gray-900">{cost}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        } else {
          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">にげるコスト</h4>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <tbody>
                  <tr>
                    <td className="px-4 py-2 text-gray-500 text-center">なし</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      })()}
      {/* ルール */}
      {(() => {
        let rulesArr: string[] = [];
        if (Array.isArray(data.rules)) {
          rulesArr = data.rules as string[];
        } else if (typeof data.rules === 'string' && data.rules) {
          rulesArr = [data.rules];
        }
        if (rulesArr.length > 0) {
          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">ルール</h4>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <thead className="bg-gray-50">
                  <tr>
                    {rulesArr.map((_, idx) => (
                      <th key={idx} className="px-4 py-2 text-left text-gray-700 font-medium border-b">ルール{idx+1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {rulesArr.map((rule, idx) => (
                      <td key={idx} className="px-4 py-2 text-gray-900">{rule}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        } else {
          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">ルール</h4>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <tbody>
                  <tr>
                    <td className="px-4 py-2 text-gray-500 text-center">なし</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      })()}

      {/* データを1列テーブルで表示 */}
      <div>
  <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
          <tbody>
            {sortedFlatData.map(({ key, value, label }) => (
              <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-0.5 font-medium text-gray-700 border-r border-gray-200">
                  {label}
                </td>
                <td className="px-4 py-0.5 text-gray-900">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  // Vercelサーバーサイドでは絶対URLが必要
  const baseUrl = typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : "";
  const apiUrl = typeof window === "undefined"
    ? `${baseUrl}/api/cards/${id}`
    : `/api/cards/${id}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });
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
                      <th className="text-left p-2 w-32 text-gray-600 bg-gray-50">名前</th>
                      <td className="p-2">{card.name || '不明'}</td>
                    </tr>
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">ゲームタイトル</th>
                      <td className="p-2">{card.gameTitle || '不明'}</td>
                    </tr>
                    {card.expansion && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">拡張パック</th>
                        <td className="p-2">{card.expansion}</td>
                      </tr>
                    )}
                    {card.setId && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">セット</th>
                        <td className="p-2">
                          <Link
                            href={`/sets/${card.setId}`}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {card.setId}
                          </Link>
                        </td>
                      </tr>
                    )}
                    {card.cardNumber && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">カードNo.</th>
                        <td className="p-2">{card.cardNumber}</td>
                      </tr>
                    )}
                    {card.apiId && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">Pokemon TCG card id</th>
                        <td className="p-2">{card.apiId}</td>
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
                    {(card.subtypesJa || card.subtypes) && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">サブタイプ</th>
                        <td className="p-2">
                          {Array.isArray(card.subtypesJa || card.subtypes) 
                            ? (card.subtypesJa || card.subtypes).join(', ') 
                            : typeof (card.subtypesJa || card.subtypes) === 'string' 
                              ? (card.subtypesJa || card.subtypes).split(',').join(', ') 
                              : (card.subtypesJa || card.subtypes)}
                        </td>
                      </tr>
                    )}
                    {card.regulationMark && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">レギュレーション</th>
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
                    {(card.cardType || card.cardTypeJa) && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">カードタイプ</th>
                        <td className="p-2">{card.cardTypeJa || card.cardType}</td>
                      </tr>
                    )}
                    {card.supertype && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">スーパータイプ</th>
                        <td className="p-2">{card.supertype}</td>
                      </tr>
                    )}
                    {(card.evolveFrom || card.evolveFromJa) && (card.evolveFrom !== '' || card.evolveFromJa !== '') && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">進化元</th>
                        <td className="p-2">{card.evolveFromJa || card.evolveFrom}</td>
                      </tr>
                    )}
                    {card.nationalPokedexNumbers && Array.isArray(card.nationalPokedexNumbers) && card.nationalPokedexNumbers.length > 0 && (
                      <tr>
                        <th className="text-left p-2 text-gray-600 bg-gray-50">全国図鑑番号</th>
                        <td className="p-2">{card.nationalPokedexNumbers.join(', ')}</td>
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
