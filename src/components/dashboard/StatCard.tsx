'use client'

import { FiTrendingUp } from 'react-icons/fi'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              <FiTrendingUp className={`w-4 h-4 mr-1 ${!trendUp && 'rotate-180'}`} />
              {trend}
            </p>
          )}
        </div>
        <div className="text-3xl text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  )
}