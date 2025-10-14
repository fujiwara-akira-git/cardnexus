import Link from 'next/link'
import { GiCardPlay } from 'react-icons/gi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <GiCardPlay className="text-3xl text-indigo-400" />
              <span className="text-xl font-bold">Card Nexus</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              すべてのカードゲームプレイヤーが集う、情報と交流の拠点。
              カードゲームライフをより豊かに。
            </p>
            <div className="text-sm text-gray-500">
              © 2024 Card Nexus. All rights reserved.
            </div>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">サービス</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/cards" className="hover:text-white transition-colors">
                  カード検索
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  マーケット
                </Link>
              </li>
              <li>
                <Link href="/decks" className="hover:text-white transition-colors">
                  デッキ共有
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  コミュニティ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">サポート</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>Made with ❤️ for all card game players</p>
        </div>
      </div>
    </footer>
  )
}