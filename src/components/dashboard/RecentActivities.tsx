'use client'

interface RecentActivity {
  id: string
  type: 'listing' | 'purchase' | 'message' | 'review'
  title: string
  description: string
  timestamp: string
  status?: string
}

interface RecentActivitiesProps {
  activities: RecentActivity[]
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'listing':
      return '📦'
    case 'purchase':
      return '💰'
    case 'message':
      return '💬'
    case 'review':
      return '⭐'
    default:
      return '📋'
  }
}

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'listing':
      return 'bg-blue-100 text-blue-800'
    case 'purchase':
      return 'bg-green-100 text-green-800'
    case 'message':
      return 'bg-yellow-100 text-yellow-800'
    case 'review':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">最近の活動</h3>
      </div>
      <div className="p-6">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">まだ活動がありません</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                      {activity.status || activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}