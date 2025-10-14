'use client'

interface PriceStatsProps {
  priceStats: {
    latest?: number
    average?: number
    min?: number
    max?: number
  }
}

export function PriceStats({ priceStats }: PriceStatsProps) {
  const formatPrice = (price?: number) => {
    if (!price) return '---'
    return `¥${price.toLocaleString()}`
  }

  const stats = [
    {
      label: '最新価格',
      value: priceStats.latest,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '平均価格',
      value: priceStats.average,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '最安値',
      value: priceStats.min,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '最高値',
      value: priceStats.max,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">価格統計</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {formatPrice(stat.value)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        ※ 価格は過去30日間のデータに基づいています
      </div>
    </div>
  )
}