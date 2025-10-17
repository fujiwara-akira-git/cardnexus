import { 
  FaSearch, 
  FaStar, 
  FaShieldAlt,
  FaUsers,
  FaTrophy,
  FaArrowRight
} from 'react-icons/fa'
import { GiCardExchange } from 'react-icons/gi'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GameSelector from '@/components/GameSelector'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              すべての
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                カードゲーム
              </span>
              <br />
              プレイヤーが集う場所
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              Card Nexusは、カード情報の検索から売買・交換まで、
              <br className="hidden sm:block" />
              カードゲームライフのすべてを一つのプラットフォームで完結させます。
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
            <Link 
              href="/auth/signup"
              className="bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>今すぐ始める</span>
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="#features"
              className="border-2 border-indigo-600 text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-indigo-50 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
            >
              機能を見る
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto px-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">10,000+</div>
              <div className="text-sm sm:text-base text-gray-600">登録カード数</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-sm sm:text-base text-gray-600">アクティブユーザー</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">1,000+</div>
              <div className="text-sm sm:text-base text-gray-600">成立取引数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Selector Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              カードゲームを選択
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              お気に入りのカードゲームを選んで、カード検索や取引を始めましょう
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <GameSelector currentGame="ポケモンカード" />
          </div>

          {/* Quick Links */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/cards?game=ポケモンカード"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">ポケモンカード検索</h3>
                  <p className="text-sm text-gray-600">G/H/Iレギュレーション対応</p>
                </div>
                <FaArrowRight className="text-yellow-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/cards?game=遊戯王"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">遊戯王カード検索</h3>
                  <p className="text-sm text-gray-600">12,000枚以上のカードデータ</p>
                </div>
                <FaArrowRight className="text-purple-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Card Nexusの主要機能
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              カードゲームプレイヤーのために設計された、包括的な機能セット
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <FaSearch className="text-3xl sm:text-4xl text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">カードデータベース</h3>
              <p className="text-sm sm:text-base text-gray-600">
                豊富なカード情報を瞬時に検索。レアリティ、効果、価格相場まで網羅的にカバー。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <GiCardExchange className="text-3xl sm:text-4xl text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">売買・交換掲示板</h3>
              <p className="text-sm sm:text-base text-gray-600">
                安全で便利な取引環境。欲しいカードを探したり、不要なカードを手放すことができます。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <FaStar className="text-3xl sm:text-4xl text-yellow-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">評価システム</h3>
              <p className="text-sm sm:text-base text-gray-600">
                取引相手の信頼性を確認。安心・安全な取引環境で、トラブルを未然に防ぎます。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <FaTrophy className="text-3xl sm:text-4xl text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">デッキ共有</h3>
              <p className="text-sm sm:text-base text-gray-600">
                オリジナルデッキを投稿・共有。他のプレイヤーの戦略から新しいアイデアを得られます。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <FaShieldAlt className="text-3xl sm:text-4xl text-red-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">セキュリティ</h3>
              <p className="text-sm sm:text-base text-gray-600">
                最高レベルのセキュリティで個人情報を保護。安心してサービスをご利用いただけます。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <FaUsers className="text-3xl sm:text-4xl text-teal-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-3">コミュニティ</h3>
              <p className="text-sm sm:text-base text-gray-600">
                活発なプレイヤーコミュニティ。情報交換や友達作りなど、より豊かなカードゲームライフを。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            今すぐCard Nexusを始めませんか？
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-8 px-2">
            無料でアカウント作成。すぐにカードゲームライフが充実します。
          </p>
          <Link 
            href="/auth/signup"
            className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center space-x-2"
          >
            <span>無料で始める</span>
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
