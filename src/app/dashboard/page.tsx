import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentActivities } from '@/components/dashboard/RecentActivities'
import { MyListings } from '@/components/dashboard/MyListings'
import { FiPackage, FiMessageSquare, FiStar, FiTrendingUp } from 'react-icons/fi'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  // モックデータ（後でAPIから取得に変更）
  const stats = {
    activeListings: 3,
    totalSales: 12,
    unreadMessages: 5,
    rating: 4.8
  }

  const recentActivities = [
    {
      id: '1',
      type: 'listing' as const,
      title: 'ピカチュウVMAX を出品しました',
      description: '美品状態で¥8,000で出品',
      timestamp: '2時間前',
      status: '出品中'
    },
    {
      id: '2',
      type: 'message' as const,
      title: '新しいメッセージが届きました',
      description: 'リザードンEXについての質問',
      timestamp: '4時間前'
    },
    {
      id: '3',
      type: 'purchase' as const,
      title: 'フシギバナV を購入しました',
      description: '取引完了済み',
      timestamp: '1日前',
      status: '完了'
    }
  ]

  const myListings = [
    {
      id: '1',
      cardName: 'ピカチュウVMAX',
      price: 8000,
      condition: '美品',
      status: 'ACTIVE' as const,
      createdAt: '2日前',
      views: 15
    },
    {
      id: '2',
      cardName: 'リザードンEX',
      price: 12000,
      condition: '極美品',
      status: 'PENDING' as const,
      createdAt: '1週間前',
      views: 23
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムセクション */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            おかえりなさい、{session.user?.name || 'ユーザー'}さん！
          </h1>
          <p className="text-gray-600 mt-2">
            Card Nexusでのあなたの活動概要です
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="出品中のアイテム"
            value={stats.activeListings}
            icon={<FiPackage />}
            trend="+2 今月"
            trendUp={true}
          />
          <StatCard
            title="総売上件数"
            value={stats.totalSales}
            icon={<FiTrendingUp />}
            trend="+3 今月"
            trendUp={true}
          />
          <StatCard
            title="未読メッセージ"
            value={stats.unreadMessages}
            icon={<FiMessageSquare />}
          />
          <StatCard
            title="評価"
            value={`${stats.rating} ⭐`}
            icon={<FiStar />}
            trend="24件のレビュー"
          />
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/listings/create"
              className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FiPackage className="w-5 h-5 mr-2" />
              新規出品
            </Link>
            <Link
              href="/cards"
              className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              🔍
              <span className="ml-2">カード検索</span>
            </Link>
            <Link
              href="/messages"
              className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <FiMessageSquare className="w-5 h-5 mr-2" />
              メッセージ
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              👤
              <span className="ml-2">プロフィール</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 出品中のアイテム */}
          <MyListings listings={myListings} />
          
          {/* 最近の活動 */}
          <RecentActivities activities={recentActivities} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
