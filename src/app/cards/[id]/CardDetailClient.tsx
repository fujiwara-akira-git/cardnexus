"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

// for simplicity in this client component accept any-shaped card object
type CardData = Record<string, any>;

const getPreferredValue = (obj: Record<string, any> | undefined, key: string) => {
  if (!obj) return undefined;
  return obj[key];
};

// Japanese labels removed — English-only UI

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

function renderJsonTable(data: Record<string, unknown>): React.JSX.Element {
  // use getPreferredValue(...) defined above
  const labels = fieldLabelsEn;
  const textKeyPriority = ['text','effectText','description','name'];

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (Array.isArray(val)) {
      return val.map(v => formatValue(v)).join(', ');
    }
    if (typeof val === 'object') {
      // prefer common nested text keys
      for (const k of textKeyPriority) {
        if (Object.prototype.hasOwnProperty.call(val, k)) {
          const candidate = getPreferredValue(val as Record<string, any>, k);
          if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
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
                <td className={`px-4 py-2 text-gray-500 ${['Abilities','Weaknesses','Attacks'].includes(label) ? 'text-left' : 'text-center'}`}>None</td>
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
                  const value = getPreferredValue(item as Record<string, unknown>, col);
                  const displayValue = formatValue(value);
                  const leftAlign = ['Abilities','Weaknesses','Attacks','Resistances'].includes(label);
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
  const value = getPreferredValue(obj as Record<string, unknown>, key);
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
            const effectiveSubValue = getPreferredValue(nestedObj as Record<string, unknown>, subKey);
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
                    const summary = subEntries.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(subEntriesToObj(subEntries), k) ?? v)}`).join(', ');
                    result.push({ key: subFullKey, value: summary, label: `${label} - ${subLabel}` });
                  }
                }
              }
            });
          } else {
            const importantFields = ['name', 'price', 'type', 'value', 'username'];
            const importantData = entries.filter(([k]) => importantFields.includes(k));
            if (importantData.length > 0) {
              const summary = importantData.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(nestedObj as Record<string, unknown>, k) ?? v)}`).join(', ');
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
            const effectiveSubValue = getPreferredValue(nestedObj, subKey);
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
                  const summary = subEntries.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(subEntriesToObj(subEntries), k) ?? v)}`).join(', ');
                  result.push({ key: subFullKey, value: summary, label: `${label} - ${subLabel}` });
                }
              }
            }
          });
        } else {
          const importantFields = ['name', 'price', 'type', 'value', 'username'];
          const importantData = entries.filter(([k]) => importantFields.includes(k));
          if (importantData.length > 0) {
              const summary = importantData.map(([k, v]) => `${labels[k] || k}: ${String(getPreferredValue(nestedObj as Record<string, unknown>, k) ?? v)}`).join(', ');
            result.push({ key: fullKey, value: summary, label });
          } else {
              result.push({ key: fullKey, value: `${entries.length} fields`, label });
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
        return renderArrayAsTable('abilities', abilities, 'Abilities');
      })()}
      {(() => {
  const attacks = Array.isArray((effectiveData as any).attacks) ? (effectiveData as any).attacks : [];
  return renderArrayAsTable('attacks', attacks, 'Attacks');
    })()}
      {(() => {
        const weaknesses = Array.isArray((effectiveData as any).weaknesses) ? (effectiveData as any).weaknesses : [];
        return renderArrayAsTable('weaknesses', weaknesses, 'Weaknesses');
      })()}

      {(() => {
        const resistances = Array.isArray((effectiveData as any).resistances) ? (effectiveData as any).resistances : [];
        return renderArrayAsTable('resistances', resistances, 'Resistances');
      })()}

      {/* always show effectText (効果) */}
      {(() => {
        const effect = getPreferredValue(effectiveData as Record<string, any>, 'effectText') as string | undefined;
        return (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Effect</h4>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">{effect && typeof effect === 'string' && effect.trim() !== '' ? effect : 'None'}</div>
          </div>
        );
      })()}

      {/* always show flavorText (フレーバーテキスト) */}
      {(() => {
        const flavor = getPreferredValue(effectiveData as Record<string, any>, 'flavorText') as string | undefined;
        return (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Flavor Text</h4>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">{flavor && typeof flavor === 'string' && flavor.trim() !== '' ? flavor : 'None'}</div>
          </div>
        );
      })()}

      {/* always show resistances, legalities, retreatCost, rules */}
      {(() => {
        const legal = getPreferredValue(effectiveData as Record<string, any>, 'legalities');
        const retreat = getPreferredValue(effectiveData as Record<string, any>, 'retreatCost');
        const rules = getPreferredValue(effectiveData as Record<string, any>, 'rules');

        const renderField = (label: string, value: any) => (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">{label}</h4>
            <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">
              {value === null || value === undefined || (Array.isArray(value) && value.length === 0)
                ? 'None'
                : typeof value === 'string'
                ? value
                : Array.isArray(value)
                ? value.map((v: any) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ')
                : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)}
            </div>
          </div>
        );

        const renderLegalities = (value: any) => {
          if (value === null || value === undefined) {
            return (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Legalities</h4>
                <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">None</div>
              </div>
            );
          }

          if (typeof value === 'string') {
            return renderField('Legalities', value);
          }

          const formatLabelsEn: Record<string, string> = { standard: 'Standard', expanded: 'Expanded', unlimited: 'Unlimited' };
          const entries = Object.entries(value as Record<string, any>);
          if (entries.length === 0) {
            return (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Legalities</h4>
                <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">None</div>
              </div>
            );
          }

          return (
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Legalities</h4>
              <div className="p-3 bg-white border border-gray-200 rounded text-sm text-gray-900">
                {entries.map(([fmt, status], idx) => {
                  const fmtLabel = formatLabelsEn[fmt] || fmt;
                  const statusLabel = String(status);
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
            {renderLegalities(legal)}
            {renderField('Retreat Cost', retreat)}
            {renderField('Rules', rules)}
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
  // image opens in a new tab when clicked

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow p-6">

        {/* language selector removed - English-only UI */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex justify-center">
              {card.imageUrl ? (
                <a href={card.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    width={320}
                    height={448}
                    className="rounded-lg border bg-white cursor-pointer"
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </a>
              ) : (
                <div className="w-80 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Basic Info</h3>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <tbody>
                  <tr>
                    <th className="text-left p-2 w-32 text-gray-600 bg-gray-50">Name</th>
                    <td className="p-2">{getPreferredValue(card, 'name') || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <th className="text-left p-2 text-gray-600 bg-gray-50">Game Title</th>
                    <td className="p-2">{getPreferredValue(card, 'gameTitle') || 'Unknown'}</td>
                  </tr>
                  {getPreferredValue(card, 'expansion') && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Expansion</th>
                      <td className="p-2">{getPreferredValue(card, 'expansion')}</td>
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
                  {getPreferredValue(card, 'types') && Array.isArray(getPreferredValue(card, 'types')) && (getPreferredValue(card, 'types') as string[]).length > 0 && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Types</th>
                      <td className="p-2">{(getPreferredValue(card, 'types') as string[]).join(', ')}</td>
                    </tr>
                  )}
                  {(getPreferredValue(card, 'subtypes') || getPreferredValue(card, 'subtypesJa')) && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Subtypes</th>
                      <td className="p-2">{Array.isArray(getPreferredValue(card, 'subtypes') || getPreferredValue(card, 'subtypesJa')) ? (getPreferredValue(card, 'subtypes') || getPreferredValue(card, 'subtypesJa')).join(', ') : typeof (getPreferredValue(card, 'subtypes') || getPreferredValue(card, 'subtypesJa')) === 'string' ? (getPreferredValue(card, 'subtypes') || getPreferredValue(card, 'subtypesJa')).split(',').join(', ') : (getPreferredValue(card, 'subtypes') || getPreferredValue(card, 'subtypesJa'))}</td>
                    </tr>
                  )}
                  {card.regulationMark && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Regulation</th>
                      <td className="p-2">{getPreferredValue(card, 'regulationMark') || card.regulationMark}</td>
                    </tr>
                  )}
                  {card.rarity && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Rarity</th>
                      <td className="p-2">{getPreferredValue(card, 'rarity') || card.rarity}</td>
                    </tr>
                  )}
                  {card.artist && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Artist</th>
                      <td className="p-2">{getPreferredValue(card, 'artist') || card.artist}</td>
                    </tr>
                  )}
                  {card.releaseDate && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Release Date</th>
                      <td className="p-2">{getPreferredValue(card, 'releaseDate') || card.releaseDate}</td>
                    </tr>
                  )}
                  {(getPreferredValue(card, 'cardType') || getPreferredValue(card, 'cardTypeJa')) && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Card Type</th>
                      <td className="p-2">{getPreferredValue(card, 'cardType') || getPreferredValue(card, 'cardTypeJa') || card.cardType}</td>
                    </tr>
                  )}
                  {card.supertype && (
                    <tr>
                      <th className="text-left p-2 text-gray-600 bg-gray-50">Supertype</th>
                      <td className="p-2">{card.supertype}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {renderJsonTable(card as Record<string, unknown>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailClient;
