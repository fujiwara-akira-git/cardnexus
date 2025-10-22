"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

// for simplicity in this client component accept any-shaped card object
type CardData = Record<string, any>;

const getPreferredValue = (obj: Record<string, any> | undefined, key: string, useJapanese: boolean) => {
  if (!obj) return undefined;
  const base = obj[key];
  if (useJapanese) {
    const jaKey = key.endsWith('Ja') ? key : `${key}Ja`;
    const ja = obj[jaKey];
    if (ja !== undefined && ja !== null) {
      // If base is missing, prefer the ja value
      if (base === undefined || base === null) return ja;
      // If base is a string, only accept ja when it's a non-empty string
      if (typeof base === 'string' && typeof ja === 'string' && ja.trim() !== '') return ja;
      // If base is an array, only accept ja when it's also an array
      if (Array.isArray(base) && Array.isArray(ja)) return ja;
      // For other types (numbers, booleans, objects), don't switch to ja
    }
  }
  return base;
};

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
  latest: '最新価格',
  average: '平均価格',
  min: '最低価格',
  max: '最高価格',
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

// English labels (default)
const fieldLabelsEn: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  nameJa: 'Name (JP)',
  gameTitle: 'Game Title',
  cardNumber: 'Card No.',
  expansion: 'Expansion',
  expansionJa: 'Expansion (JP)',
  rarity: 'Rarity',
  effectText: 'Effect Text',
  effectTextJa: 'Effect Text (JP)',
  flavorText: 'Flavor Text',
  setId: 'Set ID',
  imageUrl: 'Image URL',
  regulationMark: 'Regulation Mark',
  cardType: 'Card Type',
  cardTypeJa: 'Card Type (JP)',
  supertype: 'Supertype',
  hp: 'HP',
  types: 'Types',
  typesJa: 'Types (JP)',
  evolveFrom: 'Evolves From',
  evolveFromJa: 'Evolves From (JP)',
  artist: 'Artist',
  subtypes: 'Subtypes',
  subtypesJa: 'Subtypes (JP)',
  releaseDate: 'Release Date',
  createdAt: 'Created At',
  abilities: 'Abilities',
  attacks: 'Attacks',
  weaknesses: 'Weaknesses',
  resistances: 'Resistances',
  retreatCost: 'Retreat Cost',
  legalities: 'Legalities',
  rules: 'Rules',
  nationalPokedexNumbers: 'National Pokedex Numbers',
  priceStats: 'Price Stats',
  priceHistory: 'Price History',
  activeListings: 'Active Listings',
  latest: 'Latest',
  average: 'Average',
  min: 'Min',
  max: 'Max',
  price: 'Price',
  source: 'Source',
  condition: 'Condition',
  recordedAt: 'Recorded At',
  type: 'Type',
  value: 'Value',
  cost: 'Cost',
  damage: 'Damage',
  text: 'Text',
  quantity: 'Quantity',
  description: 'Description',
  user: 'User',
  username: 'Username',
  rating: 'Rating',
  reviewCount: 'Review Count',
  expiresAt: 'Expires At',
};

function renderJsonTable(data: Record<string, unknown>, useJapanese: boolean): React.JSX.Element {
  // use getPreferredValue(...) defined above
  const labels = useJapanese ? fieldLabels : fieldLabelsEn;
  const textKeyPriority = ['textJa','text','effectTextJa','effectText','effectJa','effect','descriptionJa','description','nameJa','name'];

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'はい' : 'いいえ';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (Array.isArray(val)) {
      return val.map(v => formatValue(v)).join(', ');
    }
    if (typeof val === 'object') {
      // prefer common nested text keys
      for (const k of textKeyPriority) {
        if (Object.prototype.hasOwnProperty.call(val, k)) {
          const candidate = getPreferredValue(val as Record<string, any>, k, useJapanese);
          if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
            // If user requested Japanese but only English exists, apply a small heuristic translator
            // client-side Japanese fallback removed — return the candidate as-is
            return String(candidate);
          }
        }
      }
      // fallback: render key: value pairs (prefer labels)
      const entries = Object.entries(val as Record<string, any>);
      if (entries.length === 0) return '';
      return entries.map(([k, v]) => `${labels[k] || k}: ${formatValue(v)}`).join(', ');
    }
    return String(val);
  };

  // (client-side translations removed)
  const renderArrayAsTable = (key: string, array: unknown[], label: string): React.ReactNode => {
    if (!Array.isArray(array)) return null;

    if (array.length === 0) {
      return (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">{label}</h4>
          <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
            <tbody>
              <tr>
                <td className={`px-4 py-2 text-gray-500 ${['Abilities','特性','Weaknesses','弱点','Attacks','ワザ'].includes(label) ? 'text-left' : 'text-center'}`}>{useJapanese ? 'なし' : 'None'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    const firstItem = array[0];
    if (typeof firstItem !== 'object' || firstItem === null) return null;

    // Build a column list that collapses 'key' and 'keyJa' pairs into a single base key
    const keys = Object.keys(firstItem as Record<string, unknown>);
    const baseSet = new Set<string>();
    for (const k of keys) {
      if (k.endsWith('Ja')) {
        const base = k.slice(0, -2);
        // if base not present in original keys, include base so we can prefer Ja
        if (!keys.includes(base)) baseSet.add(base);
      } else {
        baseSet.add(k);
      }
    }
    const columns = Array.from(baseSet).filter(col => col !== 'supertype');

    return (
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">{label}</h4>
        <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
          <thead className="bg-gray-50">
            <tr>
                {columns.map(col => (
                <th key={col} className="px-4 py-2 text-left text-gray-700 font-medium border-b">
                  {labels[col] || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {array.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  {columns.map(col => {
                  const value = getPreferredValue(item as Record<string, unknown>, col, useJapanese);
                  const displayValue = formatValue(value);
                  const leftAlign = ['Abilities','特性','Weaknesses','弱点','Attacks','ワザ'].includes(label);
                  return (
                    <td key={col} className={`px-4 py-2 text-gray-900 ${leftAlign ? 'text-left' : ''}`}>{displayValue}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const subEntriesToObj = (entries: [string, unknown][]) => Object.fromEntries(entries) as Record<string, unknown>;

  const effectiveData = data;

  const flattenData = (obj: Record<string, unknown>, prefix: string = ''): Array<{key: string, value: React.ReactNode, label: string}> => {
    const result: Array<{key: string, value: React.ReactNode, label: string}> = [];
    const priorityFields: string[] = [];

    priorityFields.forEach(key => {
  if (obj.hasOwnProperty(key)) {
  const value = getPreferredValue(obj as Record<string, unknown>, key, useJapanese);
    const fullKey = prefix ? `${prefix}.${key}` : key;
  const label = labels[key] || key;
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
            return;
          } else if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
            result.push({ key: fullKey, value: value.join(', '), label });
          } else {
            return;
          }
        } else if (typeof value === 'object') {
          const nestedObj = value as Record<string, unknown>;
          const entries = Object.entries(nestedObj);
          if (entries.length === 0) {
            return;
          } else if (key === 'priceStats') {
            entries.forEach(([subKey]) => {
              const subFullKey = `${fullKey}.${subKey}`;
              const subLabel = labels[subKey] || subKey;
              const effectiveSubValue = getPreferredValue(nestedObj as Record<string, unknown>, subKey, useJapanese);
              if (effectiveSubValue !== null && effectiveSubValue !== undefined) {
                if (typeof effectiveSubValue === 'boolean') {
                  result.push({ key: subFullKey, value: effectiveSubValue ? 'はい' : 'いいえ', label: `${label} - ${subLabel}` });
                } else if (typeof effectiveSubValue === 'string' || typeof effectiveSubValue === 'number') {
                  result.push({ key: subFullKey, value: String(effectiveSubValue), label: `${label} - ${subLabel}` });
                } else if (Array.isArray(effectiveSubValue)) {
                  if (effectiveSubValue.length > 0) {
                    result.push({ key: subFullKey, value: effectiveSubValue.join(', '), label: `${label} - ${subLabel}` });
                  }
                } else if (typeof effectiveSubValue === 'object') {
                  const subEntries = Object.entries(effectiveSubValue as Record<string, unknown>);
                  if (subEntries.length > 0) {
                    const summary = subEntries.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(subEntriesToObj(subEntries), k, useJapanese) ?? v)}`).join(', ');
                    result.push({ key: subFullKey, value: summary, label: `${label} - ${subLabel}` });
                  }
                }
              }
            });
          } else {
            const importantFields = ['name', 'price', 'type', 'value', 'username'];
            const importantData = entries.filter(([k]) => importantFields.includes(k));
            if (importantData.length > 0) {
              const summary = importantData.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(nestedObj as Record<string, unknown>, k, useJapanese) ?? v)}`).join(', ');
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

    Object.entries(obj).forEach(([key, value]) => {
      const excludedFields = ['id', 'gameTitle', 'rarity', 'hp', 'types', 'regulationMark', 'artist', 'name', 'subtypes', 'cardNumber', 'expansion', 'effectText', 'effectTextJa', 'cardType', 'cardTypeJa', 'evolveFrom', 'evolveFromJa', 'nationalPokedexNumbers', 'legalities', 'abilities', 'flavorText', 'apiId', 'setId', 'supertype'];
      if (excludedFields.includes(key) || priorityFields.includes(key)) {
        return;
      }

      const fullKey = prefix ? `${prefix}.${key}` : key;
  const label = labels[key] || key;

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
          return;
        } else if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
          result.push({ key: fullKey, value: value.join(', '), label });
        } else {
          return;
        }
      } else if (typeof value === 'object') {
        const nestedObj = value as Record<string, unknown>;
        const entries = Object.entries(nestedObj);
        if (entries.length === 0) {
          return;
        } else if (key === 'priceStats') {
          entries.forEach(([subKey]) => {
            const subFullKey = `${fullKey}.${subKey}`;
            const subLabel = labels[subKey] || subKey;
            const effectiveSubValue = getPreferredValue(nestedObj, subKey, useJapanese);
            if (effectiveSubValue !== null && effectiveSubValue !== undefined) {
              if (typeof effectiveSubValue === 'boolean') {
                result.push({ key: subFullKey, value: effectiveSubValue ? 'はい' : 'いいえ', label: `${label} - ${subLabel}` });
              } else if (typeof effectiveSubValue === 'string' || typeof effectiveSubValue === 'number') {
                result.push({ key: subFullKey, value: String(effectiveSubValue), label: `${label} - ${subLabel}` });
              } else if (Array.isArray(effectiveSubValue)) {
                if (effectiveSubValue.length > 0) {
                  result.push({ key: subFullKey, value: effectiveSubValue.join(', '), label: `${label} - ${subLabel}` });
                }
              } else if (typeof effectiveSubValue === 'object') {
                const subEntries = Object.entries(effectiveSubValue as Record<string, unknown>);
                if (subEntries.length > 0) {
                  const summary = subEntries.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(subEntriesToObj(subEntries), k, useJapanese) ?? v)}`).join(', ');
                  result.push({ key: subFullKey, value: summary, label: `${label} - ${subLabel}` });
                }
              }
            }
          });
        } else {
          const importantFields = ['name', 'price', 'type', 'value', 'username'];
          const importantData = entries.filter(([k]) => importantFields.includes(k));
          if (importantData.length > 0) {
              const summary = importantData.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(nestedObj as Record<string, unknown>, k, useJapanese) ?? v)}`).join(', ');
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

  const flatData = flattenData(data as Record<string, unknown>);

  const bottomFields = ['imageUrl', 'createdAt', 'retreatCost', 'rules'];
  const bottomData = flatData.filter(item => bottomFields.includes(item.key.split('.').pop() || ''));
  const otherData = flatData.filter(item => !bottomFields.includes(item.key.split('.').pop() || ''));

  const sortedFlatData = [...otherData, ...bottomData.filter(item => !['retreatCost', 'rules'].includes(item.key.split('.').pop() || ''))];

  return (
    <div>
      {/* render arrays and other sections (always show even if empty) */}
      {(() => {
      const abilities = Array.isArray((effectiveData as any).abilities) ? (effectiveData as any).abilities : [];
        return renderArrayAsTable('abilities', abilities, useJapanese ? '特性' : 'Abilities');
      })()}
      {(() => {
  const attacks = Array.isArray((effectiveData as any).attacks) ? (effectiveData as any).attacks : [];
  return renderArrayAsTable('attacks', attacks, useJapanese ? 'ワザ' : 'Attacks');
      })()}
      {(() => {
  const weaknesses = Array.isArray((effectiveData as any).weaknesses) ? (effectiveData as any).weaknesses : [];
  return renderArrayAsTable('weaknesses', weaknesses, useJapanese ? '弱点' : 'Weaknesses');
      })()}

      {/* always show effectText (効果) */}
      {(() => {
  const effect = getPreferredValue(effectiveData as Record<string, any>, 'effectText', useJapanese) as string | undefined;
        return (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">{useJapanese ? '効果' : 'Effect'}</h4>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">{effect && typeof effect === 'string' && effect.trim() !== '' ? effect : (useJapanese ? 'なし' : 'None')}</div>
          </div>
        );
      })()}

      {/* always show flavorText (フレーバーテキスト) */}
      {(() => {
  const flavor = getPreferredValue(effectiveData as Record<string, any>, 'flavorText', useJapanese) as string | undefined;
        return (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">{useJapanese ? 'フレーバーテキスト' : 'Flavor Text'}</h4>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">{flavor && typeof flavor === 'string' && flavor.trim() !== '' ? flavor : (useJapanese ? 'なし' : 'None')}</div>
          </div>
        );
      })()}

      {/* always show resistances, legalities, retreatCost, rules */}
      {(() => {
  const resist = getPreferredValue(effectiveData as Record<string, any>, 'resistances', useJapanese);
  const legal = getPreferredValue(effectiveData as Record<string, any>, 'legalities', useJapanese);
  const retreat = getPreferredValue(effectiveData as Record<string, any>, 'retreatCost', useJapanese);
  const rules = getPreferredValue(effectiveData as Record<string, any>, 'rules', useJapanese);

        const renderField = (label: string, value: any) => (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">{label}</h4>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">
              {value === null || value === undefined || (Array.isArray(value) && value.length === 0)
                ? (useJapanese ? 'なし' : 'None')
                : typeof value === 'string'
                  ? value
                  : Array.isArray(value)
                    ? value.map((v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ')
                    : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
              }
            </div>
          </div>
        );

        const renderLegalities = (value: any) => {
          if (value === null || value === undefined) {
            return (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">{useJapanese ? 'リーガリティ' : 'Legalities'}</h4>
                <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">{useJapanese ? 'なし' : 'None'}</div>
              </div>
            );
          }

          // If it's a string, just display it
          if (typeof value === 'string') {
            return renderField(useJapanese ? 'リーガリティ' : 'Legalities', value);
          }

          // value should be an object like { standard: 'Legal', expanded: 'Legal' }
          const formatLabelsEn: Record<string, string> = { standard: 'Standard', expanded: 'Expanded', unlimited: 'Unlimited' };
          const formatLabelsJa: Record<string, string> = { standard: 'スタンダード', expanded: 'エクスパンデッド', unlimited: 'アンリミテッド' };
          const statusMapJa: Record<string, string> = { Legal: '使用可', Banned: '禁止', Restricted: '制限' };

          const entries = Object.entries(value as Record<string, any>);
          if (entries.length === 0) {
            return (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">{useJapanese ? 'リーガリティ' : 'Legalities'}</h4>
                <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">{useJapanese ? 'なし' : 'None'}</div>
              </div>
            );
          }

          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">{useJapanese ? 'リーガリティ' : 'Legalities'}</h4>
              <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">
                {entries.map(([fmt, status], idx) => {
                  const fmtLabel = useJapanese ? (formatLabelsJa[fmt] || fmt) : (formatLabelsEn[fmt] || fmt);
                  const statusLabel = useJapanese ? (statusMapJa[status] || String(status)) : String(status);
                  return (
                    <div key={idx} className="mb-1">
                      <strong className="mr-2">{fmtLabel}:</strong>
                      <span>{statusLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        };

        return (
          <>
            {renderField(useJapanese ? '抵抗力' : 'Resistances', resist)}
            {renderLegalities(legal)}
            {renderField(useJapanese ? 'にげるコスト' : 'Retreat Cost', retreat)}
            {renderField(useJapanese ? 'ルール' : 'Rules', rules)}
          </>
        );
      })()}
      <div>
        <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
          <tbody>
            {sortedFlatData.map(({ key, value, label }) => (
              <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-0.5 font-medium text-gray-700 border-r border-gray-200">{label}</td>
                <td className="px-4 py-0.5 text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CardDetailClient = ({ card }: { card: CardData }) => {
  // always render English only (language toggle removed)
  const useJapanese = false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
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

            <div>
              <h3 className="text-lg font-medium mb-3">基本情報</h3>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <tbody>
                  <tr>
                    <th className="text-left p-2 w-32 text-gray-600 bg-gray-50">{useJapanese ? '名前' : 'Name'}</th>
                    <td className="p-2">{getPreferredValue(card, 'name', useJapanese) || (useJapanese ? '不明' : 'Unknown')}</td>
                  </tr>
                  <tr>
                    <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'ゲームタイトル' : 'Game Title'}</th>
                    <td className="p-2">{getPreferredValue(card, 'gameTitle', useJapanese) || (useJapanese ? '不明' : 'Unknown')}</td>
                  </tr>
                  {getPreferredValue(card, 'expansion', useJapanese) && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? '拡張パック' : 'Expansion'}</th>
                      <td className="p-2">{getPreferredValue(card, 'expansion', useJapanese)}</td>
                    </tr>
                  )}
                  {card.setId && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">セット</th>
                      <td className="p-2">
                        <Link href={`/sets/${card.setId}`} className="text-blue-600 hover:text-blue-800 underline">{card.setId}</Link>
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
                  {getPreferredValue(card, 'types', useJapanese) && Array.isArray(getPreferredValue(card, 'types', useJapanese)) && (getPreferredValue(card, 'types', useJapanese) as string[]).length > 0 && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'タイプ' : 'Types'}</th>
                      <td className="p-2">{(getPreferredValue(card, 'types', useJapanese) as string[]).join(', ')}</td>
                    </tr>
                  )}
                  {(getPreferredValue(card, 'subtypes', useJapanese) || getPreferredValue(card, 'subtypesJa', useJapanese)) && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'サブタイプ' : 'Subtypes'}</th>
                      <td className="p-2">{Array.isArray(getPreferredValue(card, 'subtypes', useJapanese) || getPreferredValue(card, 'subtypesJa', useJapanese)) ? (getPreferredValue(card, 'subtypes', useJapanese) || getPreferredValue(card, 'subtypesJa', useJapanese)).join(', ') : typeof (getPreferredValue(card, 'subtypes', useJapanese) || getPreferredValue(card, 'subtypesJa', useJapanese)) === 'string' ? (getPreferredValue(card, 'subtypes', useJapanese) || getPreferredValue(card, 'subtypesJa', useJapanese)).split(',').join(', ') : (getPreferredValue(card, 'subtypes', useJapanese) || getPreferredValue(card, 'subtypesJa', useJapanese))}</td>
                    </tr>
                  )}
                  {card.regulationMark && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'レギュレーション' : 'Regulation'}</th>
                      <td className="p-2">{getPreferredValue(card, 'regulationMark', useJapanese) || card.regulationMark}</td>
                    </tr>
                  )}
                  {card.rarity && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'レアリティ' : 'Rarity'}</th>
                      <td className="p-2">{getPreferredValue(card, 'rarity', useJapanese) || card.rarity}</td>
                    </tr>
                  )}
                  {card.artist && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'イラスト' : 'Artist'}</th>
                      <td className="p-2">{getPreferredValue(card, 'artist', useJapanese) || card.artist}</td>
                    </tr>
                  )}
                  {card.releaseDate && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? '発売日' : 'Release Date'}</th>
                      <td className="p-2">{getPreferredValue(card, 'releaseDate', useJapanese) || card.releaseDate}</td>
                    </tr>
                  )}
                  {(getPreferredValue(card, 'cardType', useJapanese) || getPreferredValue(card, 'cardTypeJa', useJapanese)) && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'カードタイプ' : 'Card Type'}</th>
                      <td className="p-2">{getPreferredValue(card, 'cardType', useJapanese) || getPreferredValue(card, 'cardTypeJa', useJapanese) || card.cardType}</td>
                    </tr>
                  )}
                  {card.supertype && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">{useJapanese ? 'スーパータイプ' : 'Supertype'}</th>
                      <td className="p-2">{card.supertype}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {renderJsonTable(card as Record<string, unknown>, useJapanese)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailClient;
