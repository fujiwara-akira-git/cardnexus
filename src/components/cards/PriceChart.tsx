'use client'

interface PriceHistoryItem {
  id: string
  price: number
  source: string
  condition?: string
  recordedAt: string
}

interface PriceChartProps {
  priceHistory: PriceHistoryItem[]
}

export function PriceChart({ priceHistory }: PriceChartProps) {
  // 価格データを日付順にソート
  const sortedHistory = [...priceHistory].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )

  // チャート用のデータを準備
  const chartData = sortedHistory.slice(-30) // 最新30件

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">価格データなし</h3>
        <p className="mt-1 text-sm text-gray-500">このカードの価格履歴がまだありません</p>
      </div>
    )
  }

  // 価格の最大値と最小値を計算
  const prices = chartData.map(item => item.price)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = maxPrice - minPrice

  // SVGの寸法
  const width = 800
  const height = 300
  const padding = { top: 20, right: 20, bottom: 60, left: 80 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // データポイントを座標に変換
  const points = chartData.map((item, index) => {
    const x = padding.left + (index / (chartData.length - 1)) * chartWidth
    const y = padding.top + ((maxPrice - item.price) / priceRange) * chartHeight
    return { x, y, ...item }
  })

  // パスデータを作成
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  // Y軸のティック
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return minPrice + (priceRange * i / (yTicks - 1))
  })

  // X軸のティック（最大5つ）
  const xTicks = Math.min(5, chartData.length)
  const xTickIndices = Array.from({ length: xTicks }, (_, i) => {
    return Math.floor((chartData.length - 1) * i / (xTicks - 1))
  })

  const formatPrice = (price: number) => `¥${Math.round(price).toLocaleString()}`
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">価格推移チャート</h3>
      
      {/* チャート */}
      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <svg width={width} height={height} className="block mx-auto">
          {/* グリッド線 (Y軸) */}
          {yTickValues.map((value, index) => {
            const y = padding.top + ((maxPrice - value) / priceRange) * chartHeight
            return (
              <g key={`y-grid-${index}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatPrice(value)}
                </text>
              </g>
            )
          })}

          {/* グリッド線 (X軸) */}
          {xTickIndices.map((dataIndex, index) => {
            const point = points[dataIndex]
            return (
              <g key={`x-grid-${index}`}>
                <line
                  x1={point.x}
                  y1={padding.top}
                  x2={point.x}
                  y2={padding.top + chartHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={point.x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatDate(point.recordedAt)}
                </text>
              </g>
            )
          })}

          {/* 価格ライン */}
          <path
            d={pathData}
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
          />

          {/* データポイント */}
          {points.map((point, index) => (
            <g key={`point-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              
              {/* ツールチップ的な情報（ホバー時に表示したい場合） */}
              <title>
                {formatDate(point.recordedAt)}: {formatPrice(point.price)} ({point.source})
              </title>
            </g>
          ))}

          {/* 軸ラベル */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
          >
            日付
          </text>
          <text
            x={15}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
            transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
          >
            価格 (円)
          </text>
        </svg>
      </div>

      {/* 凡例・統計情報 */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 rounded p-3">
          <div className="font-medium text-blue-900">データ期間</div>
          <div className="text-blue-700">
            {formatDate(chartData[0].recordedAt)} ～ {formatDate(chartData[chartData.length - 1].recordedAt)}
          </div>
        </div>
        <div className="bg-green-50 rounded p-3">
          <div className="font-medium text-green-900">価格変動</div>
          <div className="text-green-700">
            {formatPrice(maxPrice - minPrice)} (幅)
          </div>
        </div>
        <div className="bg-purple-50 rounded p-3">
          <div className="font-medium text-purple-900">データ件数</div>
          <div className="text-purple-700">
            {chartData.length}件
          </div>
        </div>
      </div>
    </div>
  )
}